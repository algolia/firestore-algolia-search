### See it in action

You can test out this extension right away:

1.  Go to the [Cloud Firestore tab](https://console.firebase.google.com/project/${param:PROJECT_ID}/database/firestore/data).

1.  If it doesn't exist already, create a collection called `${param:COLLECTION_PATH}`.

1.  Create, update, or delete a document in the `${param:COLLECTION_PATH}` collection.  Go to Algolia's dashboard and verify in Algolia that a record is created, updated, or deleted in the `${param:ALGOLIA_INDEX_NAME}` index for application id `${param:ALGOLIA_APP_ID}`.

### Using the extension

This extension listens to the Cloud Firestore collection `${param:COLLECTION_PATH}`. If you create, update, or delete a document within that collection, this extension will:

- Indexes the document and send all the fields or configured fields defined in the extension.
- or, removes the record from Algolia index if the document is deleted.

### _(Optional)_ Import existing documents or Reindex after configuration changes
This extension starts monitoring the `${param:COLLECTION_PATH}` collection after a successful installation. Any existing documents created before the extension installation can be back-filled into your Algolia `${param:ALGOLIA_INDEX_NAME}` Index using the import script.  Also, you will need to run the import script if you change the Indexable Fields, Index Name, Application Id, and/or API Key configuration.

The import script will read all existing documents in the `${param:COLLECTION_PATH}` collection and insert them into the Algolia `${param:ALGOLIA_INDEX_NAME}` index.

##### Important notes

- You must run the import script over the entire collection **_after_** installing the Search with Algolia extension; otherwise you will have missing records in your Algolia `${param:ALGOLIA_INDEX_NAME}` index.
- `lastmodified` attributed is added to all Algolia records to eliminate race condition issues related from the Cloud Function cold start.

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
    - Clear out the `FIELDS` or/and `TRANSFORM_FUNCTION` params if it contains `{ unspecified parameter }` in the command below since it's an invalid value.
      ```
      npx firestore-algolia-search
      ```
      Below are the questions that will be asked:
      ```
      What is the Region? ${param:LOCATION}
      What is the Project Id? ${param:PROJECT_ID}
      What is the Algolia App Id? ${param:ALGOLIA_APP_ID}
      What is the Algolia Api Key? ${param:ALGOLIA_API_KEY}
      What is the Algolia Index Name? ${param:ALGOLIA_INDEX_NAME}
      What is the Collection Path? ${param:COLLECTION_PATH}
      What are the Fields to extract? ${param:FIELDS}
      What is the Transform Function? ${param:TRANSFORM_FUNCTION}
      What is the path to the Google Application Credential File? </path/to/service/account/key>
      ```
      **NOTE**: Make sure that there is no space inbetween the specified `FIELDS`. E.g. `name,category,views` ✅ | `name, category, views` ❌.
### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
