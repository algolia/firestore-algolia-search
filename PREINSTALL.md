Use this extension to index your Cloud Firestore data to Algolia and keep it synced.  The extension is applied and configured on a Firestore [collection](https://firebase.google.com/docs/firestore/data-model#collections).

This extension listens for changes on the specified collection. If you add a [document](https://firebase.google.com/docs/firestore/data-model#documents), the extension indexes it as a [record in Algolia](https://www.algolia.com/doc/faq/basics/what-is-a-record/). The extension only indexes the fields defined in the extension configuration and uses the [document Id](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document) as the Algolia [object Id](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/#using-unique-object-identifiers).

Anytime you update a document, the extension propagates the update to the corresponding Algolia record. If you delete a document, the extension removes the corresponding Algolia record.

#### Important

Upon installation or when the extension's configuration is changed, the documents in the specified collection will be synced to Algolia.

#### Additional setup

Before installing this extension, make sure that you've
[set up a Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart)
in your Firebase project.

You must also have an Algolia account set up before installing this
extension. You can do so on the [Algolia](https://www.algolia.com/) site.

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
