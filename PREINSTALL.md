Use this extension to index your Cloud Firestore collection.  The extension is applied and configured on a collection.

This extension listens for changes to the specified collection. If a document is added, updated, or deleted, this
extension will:

- Add/Update - document will be indexed into Algolia.  The fields defined in the extension configuration will be used to send to Algolia.  The document Id will be used as the object id in Algolia.
- Delete - the Algolia record associate to document id will be removed.

#### Additional setup

Before installing this extension, make sure that you've
[set up a Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart)
in your Firebase project.

You must also have an Algolia account set up before installing this
extension. You can do so on the [Algolia][https://www.algolia.com/] site.

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
