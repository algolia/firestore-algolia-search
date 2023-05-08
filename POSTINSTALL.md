### See it in action

You can test out this extension right away:

1.  Go to the [Cloud Firestore tab](https://console.firebase.google.com/project/${param:PROJECT_ID}/database/firestore/data).

1.  If it doesn't exist already, create a collection called `${param:COLLECTION_PATH}`.

1.  Create, update, or delete a document in the `${param:COLLECTION_PATH}` collection.  Go to Algolia's dashboard and verify in Algolia that a record is created, updated, or deleted in the `${param:ALGOLIA_INDEX_NAME}` index for application id `${param:ALGOLIA_APP_ID}`.

### Collection import

If the collection named `${param:COLLECTION_PATH}` exists, the extension has begun importing documents into the `${param:ALGOLIA_INDEX_NAME}` Algolia Index. Additionally, a full reindex will occur each time the extension's configuration changes.

A `lastmodified` attribute is added to Algolia records to eliminate race condition issues related from the Cloud Function cold start.

### Using the extension

This extension listens to the Cloud Firestore collection `${param:COLLECTION_PATH}`. If you create, update, or delete a document within that collection, this extension will:

- Indexes the document and send all the fields or configured fields defined in the extension.
- or, removes the record from Algolia index if the document is deleted.

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
