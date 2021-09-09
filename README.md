# Search with Algolia

**Author**: Algolia (**[https://www.algolia.com](https://www.algolia.com)**)

**Description**: Enable full text search of your Cloud Firestore data with Algolia.

**Details**: Use this extension to index your Cloud Firestore data to [Algolia](https://www.algolia.com/doc/) and keep it synced.

You can then [configure your relevance](/doc/guides/getting-started/how-algolia-works/in-depth/implementation-process/#configuring-relevance) using the [Algolia dashboard](https://www.algolia.com/dashboard) or [API clients](/doc/api-client/getting-started/install/javascript/). From there, you can use Algolia's [front-end libraries](/doc/guides/building-search-ui/what-is-instantsearch/js/) to incorporate search components into your Firebase app's UI.

---

We welcome [bug reports and feature requests](https://github.com/algolia/firestore-algolia-search/issues/new) as well as pull requests in this GitHub repository.

### Firebase CLI

```bash
firebase ext:install algolia/firestore-algolia-search --project=<your-project-id>
```

> Learn more about installing extensions in the Firebase Extensions documentation: [console](https://firebase.google.com/docs/extensions/install-extensions?platform=console), [CLI](https://firebase.google.com/docs/extensions/install-extensions?platform=cli)

---

#### Details

Use this extension to index your Cloud Firestore data to Algolia and keep it synced.  The extension is applied and configured on a Firestore [collection](https://firebase.google.com/docs/firestore/data-model#collections) or [subcollection](https://firebase.google.com/docs/firestore/data-model#subcollections).

This extension listens for changes on the specified collection. If you add a [document](https://firebase.google.com/docs/firestore/data-model#documents), the extension indexes it as a [record in Algolia](https://www.algolia.com/doc/faq/basics/what-is-a-record/). The extension only indexes the fields defined in the extension configuration and uses the [document Id](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document) as the Algolia [object Id](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/#using-unique-object-identifiers).

Anytime you update a document, the extension propagates the update to the corresponding Algolia record. If you delete a document, the extension removes the corresponding Algolia record.

#### Additional setup

Before installing this extension, make sure that you've set up:
- [Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart) in your Firebase project.
- [Algolia](https://www.algolia.com/) account.


#### Billing

This extension uses the following Firebase services which may have associated charges:

- Cloud Firestore
- Cloud Functions

This extension also uses the following third-party services:

- Algolia ([pricing information](https://www.algolia.com/pricing))

You are responsible for any costs associated with your use of these services.

#### Note from Firebase

To install this extension, your Firebase project must be on the Blaze (pay-as-you-go) plan. You will only be charged for the resources you use. Most Firebase services offer a free tier for low-volume use. [Learn more about Firebase billing.](https://firebase.google.com/pricing)

You will be billed a small amount (typically less than $0.10) when you install or reconfigure this extension. See Cloud Functions under [Firebase Pricing](https://firebase.google.com/pricing) for a detailed explanation.

#### Configuration Parameters

Cloud Functions Location: Where do you want to deploy the functions created for this extension?
  You usually want a location close to your database.
  For help selecting a location, refer to the
  [location selection guide](https://firebase.google.com/docs/functions/locations).

- Collection Path: What is the path to the Cloud Firestore collection where the extension should monitor for changes?
  For subcollection, the syntax is `parent_collection/{parentId}/target_collection`. (please note, there is not depublication process on subcollections).

- Fields: What document fields should be indexed to provide the best search experience? For more information on which fields to index to Algolia, see the [Algolia documentation on records](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/#algolia-records).
  This can be a comma separated list or left blank to index all fields.
  For performance reasons, [record size is limited](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/in-depth/index-and-records-size-and-usage-limitations/#record-size-limits).
  If you're receiving errors that your records are too large, refer to the [reducing record size documentation](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/how-to/reducing-object-size/).

- Algolia Application ID: What is the Algolia Application Id?
  This is the Algolia application you want to index your data to.
  You can find your credentials including application ID on your Algolia dashboard,
  under the [API keys tab](https://www.algolia.com/api-keys).

- Algolia API Key: What is your Algolia API key?
  We recommend [creating a new API key](https://www.algolia.com/doc/guides/security/api-keys/#creating-and-managing-api-keys)
  with "addObject", "deleteObject", "listIndexes", "deleteIndex", "editSettings", and "settings" permissions.
  **Do not use the Admin API key**.

- Algolia Index Name: What is the Algolia index name?
  This is the name of the [Algolia index](https://www.algolia.com/doc/faq/basics/what-is-an-index/)
  where the records will be persisted.
  Refer to [naming your index](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/#naming-your-index) for more information.

- Transform Function Name (experimental): What is the Firebase Cloud Function Name?
  This is the name of the Firestore Cloud Function for transforming the data before transmitting to Algolia for indexing.
  This function should be deployed to the same Firebase Project and Location as the Firestore/Algolia extension.
  Refer to [Call functions for your app](https://firebase.google.com/docs/functions/callable).
  Below is an example of a Transform function used for my testing:
  ```javascript
    import * as functions from "firebase-functions";

    const doStuffToData = (payload: any) => {
      return {
      ...payload,
      "hello": "world",
      };
    };

    export const helloWorld = functions.https.onCall((payload) => {
      const transformedData = doStuffToData(payload);
      return transformedData;
    });
  ```
  **Note**: The Transform Firebase Function should be set up to unauthenticated users at this time.

#### Cloud Functions

- **executeIndexOperation:** Firestore document-triggered function that creates, updates, or deletes data in Algolia.
