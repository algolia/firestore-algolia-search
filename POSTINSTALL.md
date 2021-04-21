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

##### Important notes

- You must run the import script over the entire collection **_after_** installing the Search with Algolia extension; otherwise you will have missing records in your Algolia `${param:ALGOLIA_INDEX_NAME}` index.

- The import script can take up to _O(collection size)_ time to finish.

#### Run the script

The script will use the extension configuration before the import process starts.

Run the import process using `npx`.

1.  Make sure that you've installed the required tools to run the import script:
    - To access the `npx` command tools, you need to install [Node.js](https://www.nodejs.org/).
    - If you use `npm` v5.1 or earlier, you need to explicitly install `npx`. Run `npm install --global npx`.

1.  The import script uses Application Default Credentials to communicate with Firebase.
    Please follow the instructions to [generate a key for your service account](https://firebase.google.com/docs/admin/setup#initialize-sdk).

1.  Execute the below command:
    - Update the path to the Google Application credentials.
    - Clear out the `FIELDS` param if it contains `{ unspecified parameter }` in the command below since it's an invalid value.
      ```
        LOCATION=${param:LOCATION}\
        ALGOLIA_APP_ID=${param:ALGOLIA_APP_ID}\
        ALGOLIA_API_KEY=${param:ALGOLIA_API_KEY}\
        ALGOLIA_INDEX_NAME=${param:ALGOLIA_INDEX_NAME}\
        COLLECTION_PATH=${param:COLLECTION_PATH}\
        FIELDS=${param:FIELDS}\
        GOOGLE_APPLICATION_CREDENTIALS=</path/to/service/account/key>\
        npx firestore-algolia-search
      ```

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
