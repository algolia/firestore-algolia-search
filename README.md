# Search with Algolia

**Author**: Algolia (**[https://www.algolia.com](https://www.algolia.com)**)

**Description**: Enable full text search of your Cloud Firestore data with Algolia.

---

We welcome [bug reports and feature requests](https://github.com/algolia/algolia-firebase-extension/issues/new) as well as pull requests in this GitHub repository.

### Firebase CLI

```bash
firebase ext:install aloglia-firebase/firestore-algolia-search --project=<your-project-id>
```

> Learn more about installing extensions in the Firebase Extensions documentation: [console](https://firebase.google.com/docs/extensions/install-extensions?platform=console), [CLI](https://firebase.google.com/docs/extensions/install-extensions?platform=cli)

---

**Details**:

Use this extension to index your Cloud Firestore collection.  The extension is applied and configured on a collection.

This extension listens for changes to the specified collection. If a document is added, updated, or deleted, this
extension will:

- Add/Update - document will be indexed into Algolia.  The fields defined in the extension configuration will be used to send to Algolia.  The document Id will be used as the object id in Algolia.
- Delete - the Algolia record associate to document id will be removed.

#### Additional setup

Before installing this extension, make sure that you've set up:
- [Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart) in your Firebase project.
- [Algolia](https://www.algolia.com/) account.


#### Billing

To install an extension, your project must be on the
[Blaze (pay as you go) plan][blaze-pricing].

- You will be charged [around $0.01 per month][pricing-examples] for each
  instance of this extension you install.
- This extension uses other Firebase and Google Cloud Platform services,
  which have associated charges if you exceed the service's free tier:
    - Cloud Functions (Node.js 10+ runtime. [See FAQs][faq].)
    - Cloud Firestore

[blaze-pricing]: https://firebase.google.com/pricing
[pricing-examples]: https://cloud.google.com/functions/pricing#pricing_examples
[faq]: https://firebase.google.com/support/faq#expandable-24

**Configuration Parameters:**

- Cloud Functions Location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

- Collection Path: What is the path to the collection that you want to index?

- Fields: What are fields in the document do you want to index?

**NOTE:** This configuration can be left empty if you want to index all the fields in this document.

- Algolia Application ID: What is the Algolia application id that contains the index?

- Algolia API Key: What is the Algolia API key with addObject, deleteObject, listIndexes, deleteIndex, editSettings, and settings permissions.

- Algolia Index Name: What is the Algolia index name that will contain the collection document records.

**Cloud Functions:**

- **executeIndexOperation:** Listens for create, update, and delete triggers on a document in the specified collection.

