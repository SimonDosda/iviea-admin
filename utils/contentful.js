const contentful = require("contentful-management");

// init contentful
const client = contentful.createClient(
  { accessToken: process.env.CONTENTFUL_TOKEN },
  {
    type: "plain",
    defaults: {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environmentId: process.env.CONTENTFUL_ENV_ID
    }
  }
);

const locale = "en-US";

async function getEntries(contentTypes) {
  const entries = await client.entry.getMany({
    query: { skip: 0, limit: 100 }
  });
  return entries.items.filter(item =>
    contentTypes.includes(item.sys.contentType.sys.id)
  );
}

async function getProductEntries(entries) {
  const entriesById = entries.reduce((res, entry) => {
    if (entry.sys.contentType.sys.id === "product") {
      if (!(entry.sys.id in res)) {
        res[entry.sys.id] = { variants: [] };
      }
      res[entry.sys.id].product = entry.fields;
    } else {
      const fields = { ...entry.fields };
      if (fields.product) {
        const productId = fields.product[locale].sys.id;
        delete fields.product;
        if (!(productId in res)) {
          res[productId] = { variants: [] };
        }
        res[productId].variants.push(fields);
      } else {
        console.log(fields.name[locale] + " is not link to a product");
      }
    }
    return res;
  }, {});
  return Object.values(entriesById);
}

async function createEntry(contentTypeId, fields) {
  return await client.entry.create({ contentTypeId }, { fields });
}

async function updateEntries(entries) {
  const seenProducts = [];
  const seenVariants = [];

  const currentProducts = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "product"
    }
  });
  const currentVariants = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "variant"
    }
  });

  for (let index = 0; index < currentProducts.items.length; index++) {
    const product = currentProducts.items[index];
    const productVariants = currentVariants.items.filter(
      ({ fields }) => fields.product[locale].sys.id === product.sys.id
    );
    const newEntry = await entries.find(
      entry => entry.product.sku[locale] === product.fields.sku[locale]
    );

    if (newEntry) {
      seenProducts.push(newEntry.product.sku[locale]);
      client.entry.update(
        { entryId: product.sys.id },
        { fields: newEntry.product, sys: product.sys }
      );
      productVariants.forEach(variant => {
        const newVariant = newEntry.variants.find(
          ({ sku }) => sku[locale] === variant.fields.sku[locale]
        );
        if (newVariant) {
          seenVariants.push(newVariant.sku[locale]);
          client.entry.update(
            { entryId: variant.sys.id },
            { fields: newVariant, sys: variant.sys }
          );
        } else {
          client.entry.delete({ entryId: variant.sys.id });
        }
      });
    } else {
      client.entry.delete({ entryId: product.sys.id });
      currentVariants.forEach(variant => {
        client.entry.delete({ entryId: variant.sys.id });
      });
    }
  }

  for (let index = 0; index < entries.length; index++) {
    const { product, variants } = entries[index];
    let entry = null;
    if (!seenProducts.includes(product.sku[locale])) {
      entry = await createEntry("product", {
        ...product,
        images: { [locale]: [] }
      });
    } else {
      entry = currentProducts.items.find(
        ({ fields }) => fields.sku[locale] === product.sku[locale]
      );
    }
    variants.forEach(variant => {
      if (!seenVariants.includes(variant.sku[locale])) {
        createEntry("variant", {
          ...variant,
          images: { [locale]: [] },
          product: {
            [locale]: {
              sys: { id: entry.sys.id, linkType: "Entry", type: "Link" }
            }
          }
        });
      }
    });
  }
}

module.exports = { getEntries, getProductEntries, createEntry, updateEntries };
