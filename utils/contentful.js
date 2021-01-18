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
  const products = entries.filter(
    entry => entry.sys.contentType.sys.id === "product"
  );
  const variantById = products.reduce((res, product) => {
    product.fields.variants[locale].forEach(variant => {
      res[variant.sys.id] = variant.fields;
    });
    return res;
  }, {});
  return products.map(product => ({
    product: product.fields,
    variants: product.fields.variants[locale].map(
      variant => variantById[variant.sys.id]
    )
  }));
}

async function createEntry(contentTypeId, fields) {
  return await client.entry.create({ contentTypeId }, { fields });
}

async function updateEntries(entries) { 
  const newVariantsSkus = [];

  const currentVariants = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "variant"
    }
  });
  
  const seenProducts = [];
  const currentProducts = await client.entry.getMany({
    query: {
      "sys.contentType.sys.id": "product"
    }
  
  });
  
  // update or create variants
for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
  const entry = entries[entryIndex];
  for (let variantIndex = 0; variantIndex < entry.variants.length; variantIndex++) {
    const variant = entry.variants[variantIndex];
    newVariantsSkus.push(variant.sku[locale]);
    const existingVariant = currentVariants.items.find(item => item.fields.sku[locale] === variant.sku[locale]);
    if (existingVariant) {
      client.entry.update(
            { entryId: existingVariant.sys.id },
            {              fields: variant,
              sys: existingVariant.sys
            }
          );
    } else {
      createEntry("variant", {
          ...variant,
          images: { [locale]: [] }
        });
    }
  }
}
  
  // update and create products
  
  // remove obsolete variants
  productVariants.forEach(variant => {
        client.entry.delete({ entryId: variant.sys.id });
      });
  
  
  for (let index = 0; index < currentProducts.items.length; index++) {
    const currentProduct = currentProducts.items[index];
    
    const newEntry = await entries.find(
      entry => entry.product.sku[locale] === currentProduct.fields.sku[locale]
    );

    if (newEntry) {
      seenProducts.push(newEntry.product.sku[locale]);
      
      currentProduct.variants[locale].forEach(variant => {
        const newVariant = newEntry.variants.find(
          ({ sku }) => sku[locale] === variant.fields.sku[locale]
        );
        
        if (newVariant) {
          seenVariants.push(newVariant.sku[locale]);
          client.entry.update(
            { entryId: variant.sys.id },
            {              fields: newVariant,
              sys: variant.sys
            }
          );
        } else {
          client.entry.delete({ entryId: variant.sys.id });
        }
      });
      client.entry.update(
        { entryId: product.sys.id },
        { fields: newEntry.product, sys: product.sys }
      );
        
      
    } else {
      client.entry.delete({ entryId: product.sys.id });
      productVariants.forEach(variant => {
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
