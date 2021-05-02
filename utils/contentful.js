import contentful from "contentful-management";

// init contentful
const client = contentful.createClient(
  { accessToken: process.env.CONTENTFUL_TOKEN },
  {
    type: "plain",
    defaults: {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environmentId: process.env.CONTENTFUL_ENV_ID,
    },
  }
);

const locale = process.env.CONTENTFUL_LOCALE;

async function getEntries() {
  const entries = await client.entry.getMany({});
  return entries.items;
}

export async function getContentfulEntries() {
  const entries = await getEntries();
  const products = entries.filter(
    ({ sys }) => sys.contentType.sys.id === "product"
  );
  const variants = entries.filter(
    ({ sys }) => sys.contentType.sys.id === "variant"
  );
  const variantById = variants.reduce((res, variant) => {
    res[variant.sys.id] = variant.fields;
    return res;
  }, {});
  return products.map((product) => ({
    product: product.fields,
    variants: product.fields.variants[locale].map(
      (variant) => variantById[variant.sys.id]
    ),
  }));
}

export async function createEntry(contentTypeId, fields) {
  return await client.entry.create({ contentTypeId }, { fields });
}

export async function updateEntries(entries) {
  const currentVariants = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "variant",
    },
  });

  // update or create variants
  const variantsById = {};
  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    const { product, variants } = entries[entryIndex];
    delete product.printful;
    delete product.contentful;
    for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
      const variant = variants[variantIndex];
      delete variant.printful;
      delete variant.contentful;
      const existingVariant = currentVariants.items.find(
        (item) => item.fields.id[locale] === variant.id[locale]
      );
      if (existingVariant) {
        variantsById[variant.id[locale]] = existingVariant;
        client.entry.update(
          { entryId: existingVariant.sys.id },
          { fields: variant, sys: existingVariant.sys }
        );
      } else {
        const newVariant = await createEntry("variant", {
          ...variant,
          images: { [locale]: [] },
        });
        variantsById[variant.id[locale]] = newVariant;
      }
    }
  }

  // remove obsolete variants
  currentVariants.items.forEach((variant) => {
    if (!variantsById[variant.fields.id[locale]]) {
      client.entry.delete({ entryId: variant.sys.id });
    }
  });

  const currentProducts = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "product",
    },
  });

  // update or create products
  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    const { product, variants } = entries[entryIndex];
    const fields = {
      ...product,
      variants: {
        [locale]: variants.map((variant) => ({
          sys: {
            id: variantsById[variant.id[locale]].sys.id,
            linkType: "Entry",
            type: "Link",
          },
        })),
      },
    };

    const existingProduct = currentProducts.items.find(
      (item) => item.fields.id[locale] === product.id[locale]
    );
    if (existingProduct) {
      client.entry.update(
        { entryId: existingProduct.sys.id },
        { fields, sys: existingProduct.sys }
      );
    } else {
      // create assets
      const name = product.name[locale];
      const images = { [locale]: [] };
      for (let i = 0; i < product.images[locale].length; i++) {
        let file = product.images[locale][i];
        console.dir(file, { depth: null });
        let asset = await createAsset(name, file);
        images[locale].push({
          sys: { type: "Link", linkType: asset.sys.type, id: asset.sys.id },
        });
      }
      // create product
      const productToSend = { ...fields, images };
      createEntry("product", productToSend);
    }
  }

  // remove obsolete variants
  currentProducts.items.forEach((product) => {
    if (
      !entries.find(
        (entry) => product.fields.sku[locale] === entry.product.sku[locale]
      )
    ) {
      client.entry.delete({ entryId: product.sys.id });
    }
  });
}

export async function createAsset(title, file) {
  const fields = {
    title: { [locale]: title },
    file: { [locale]: file },
  };

  return await client.asset.create({}, { fields });
}

export default {
  getEntries,
  getProductEntries: getContentfulEntries,
  createEntry,
  updateEntries,
};
