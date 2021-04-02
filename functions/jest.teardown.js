module.exports = async function() {
  delete process.env.LOCATION;
  delete process.env.ALGOLIA_APP_ID;
  delete process.env.ALGOLIA_API_KEY;
  delete process.env.ALGOLIA_INDEX_NAME;
  delete process.env.COLLECTION_PATH;
  delete process.env.FIELDS;
  delete process.env.GCLOUD_PROJECT;
};
