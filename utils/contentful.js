const contentful = require('contentful-management');

// init contentful
const client = contentful.createClient(
  { accessToken: process.env.CONTENTFUL_TOKEN },
  { type: 'plain', defaults: {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENV_ID
  } }
)

async function getEntries(contentTypes) {
  const entries = await client.entry.getMany({ query: { skip: 0, limit: 100} });
  return entries.items.filter(item => contentTypes.includes(item.sys.contentType.sys.id));
} 

async function getProductEntries(entries) {
  const entriesById = entries.reduce((res, entry) => {
    if (entry.sys.contentType.sys.id === 'product') {
      if (!(entry.sys.id in res)) {
        res[entry.sys.id] = {variants: []}
      } 
      res[entry.sys.id].product = entry.fields
    } else {
      const fields = {...entry.fields};
      const productId = fields.product.en.sys.id;
      delete fields.product;
      if (!(productId in res)) {
        res[productId] = {variants: []}
      } 
      res[productId].variants.push(fields);
    }
    return res;
  }, {})
  return Object.values(entriesById);
}

async function createEntry(contentTypeId, fields) {
  return await client.entry.create({ contentTypeId }, { fields });
}

async function updateEntries(entries) {
  entries.forEach(async ({product, variants}) => {
    const entry = await createEntry("product", {...product, images: {en: []}});
    variants.forEach(variant => {
      createEntry("variant", {...variant, images: {en: []}, product: {en: entry.sys.contentType}})
    })
  } )   
}

module.exports = {getEntries, getProductEntries, createEntry, updateEntries};