const contentful = require('contentful-management');

// init contentful
const client = contentful.createClient(
  { accessToken: process.env.CONTENTFUL_TOKEN },
  { type: 'plain', defaults: {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENV_ID
  } }
)

async function getEntries() {
  return await client.entry.getMany({
    query: { skip: 0, limit: 100}
  })
} 

async function createEntry(contentTypeId, fields) {
  return await client.entry.create({ contentTypeId }, { fields });
}

module.exports = {getEntries, }