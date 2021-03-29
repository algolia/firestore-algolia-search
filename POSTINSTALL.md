### See it in action

You can test out this extension right away:

1.  Go to the [Cloud Firestore tab](https://console.firebase.google.com/project/${param:PROJECT_ID}/database/firestore/data).

1.  If it doesn't exist already, create a collection called `${param:COLLECTION_PATH}`.

1.  Create, update, or delete a document in the `${param:COLLECTION_PATH}` collection.  Go to Algolia's dashboard and verify in Algolia that a record is created, updated, or deleted in the `${param:ALGOLIA_INDEX_NAME}` index for application id `${param:ALGOLIA_APP_ID}`.

### Using the extension

This extension listens to the Cloud Firestore collection `${param:COLLECTION_PATH}`. If you create, update, or delete a document within that collection, this extension will:

- Indexes the document and send all the fields or configured fields defined in the extension.
- or, removes the record from Algolia index if the document is deleted.

### _(Optional)_ Import existing documents
This extension only sends the documents that have been changed -- it does not index existing documents into Algolia. In order to backfill your Algolia `${param:ALGOLIA_INDEX_NAME}` Index with all the documents in your collection, you can run the import script provided by this extension.

The import script can read all existing documents in a Cloud Firestore collection and insert them into your Algolia `${param:ALGOLIA_INDEX_NAME}` index.

The `npm run import` is for use with the official Firebase Extension [**Search with Algolia**](https://github.com/algolia/algolia-firebase-extension).

##### Important notes

- You must run the import script over the entire collection **_after_** installing the Search with Algolia extension; otherwise you will have missing records in your Algolia `${param:ALGOLIA_INDEX_NAME}` index.

- The import script can take up to _O(collection size)_ time to finish.

#### Run the script

The import script uses several values from your installation of the extension:
- Cloud Functions Location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

- Collection Path: What is the path to the collection that you want to index?

- Fields: What are fields in the document do you want to index?

**NOTE:** This configuration can be left empty if you want to index all the fields in this document.

- Algolia Application ID: What is the Algolia application id that contains the index?

- Algolia API Key: What is the Algolia API key with addObject, deleteObject, listIndexes, deleteIndex, editSettings, and settings permissions.

- Algolia Index Name: What is the Algolia index name that will contain the collection document records.

Run the import script using [`npx` (the Node Package Runner)](https://www.npmjs.com/package/npx) via `npm` (the Node Package Manager).

1.  Make sure that you've installed the required tools to run the import script:

- To access the `npm` command tools, you need to install [Node.js](https://www.nodejs.org/).
- If you use `npm` v5.1 or earlier, you need to explicitly install `npx`. Run `npm install --global npx`.

1.  Set up credentials. The import script uses Application Default Credentials to communicate with Firebase.

    Please follow the instructions to [generate a key for your service account](https://firebase.google.com/docs/admin/setup#initialize-sdk).

1.  Clone [algolia-firebase-extension](https://github.com/algolia/algolia-firebase-extension) repo.
1.  Run the import script via `npx`.

- Execute the following command in the `functions` folder:

  ```
  LOCATION=${param:LOCATION}\
  ALGOLIA_APP_ID=${param:ALGOLIA_APP_ID}\
  ALGOLIA_API_KEY=${param:ALGOLIA_API_KEY}\
  ALGOLIA_INDEX_NAME=${param:ALGOLIA_INDEX_NAME}\
  COLLECTION_PATH=${param:COLLECTION_PATH}\
  FIELDS=${param:FIELDS}\
  GOOGLE_APPLICATION_CREDENTIALS=</path/to/service/account/key>\
  npm run import
  ```
**NOTE:** If the `FIELDS` param contains `{ unspecified parameter }` in the command above, please clear it out since this is an invalid value.

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
