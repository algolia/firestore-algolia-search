module.exports = async function () {
  process.env = Object.assign(process.env, {
    LOCATION: 'us-central1',
    ALGOLIA_APP_ID: '',
    ALGOLIA_API_KEY: '',
    ALGOLIA_INDEX_NAME: '',
    COLLECTION_PATH: '',
    FIELDS: '',
    GCLOUD_PROJECT: ''
  });
};
