# @algolia/firestore-algolia-search

Index a Cloud Firestore collection into [Algolia](https://algolia.com) using
2nd Gen Cloud Functions. This is the Function Kit version of the
`firestore-algolia-search` Firebase Extension.

## Installation

```bash
cd functions
npm install @algolia/firestore-algolia-search
```

Requires Node.js >= 22, `firebase-functions` >= 7.3.0 and `firebase-admin`
(peer dependencies).

Re-export the functions from your `functions/src/index.ts`:

```ts
export * from "@algolia/firestore-algolia-search";
```

Then set the parameters below, store the API key as a secret
(`firebase functions:secrets:set ALGOLIA_API_KEY`) and deploy:

```bash
firebase deploy --only functions
```

The IAM role `roles/datastore.user` is declared in code and granted at deploy
time. A full indexing run is triggered automatically after the first deploy and
after every redeploy (when `DO_FULL_INDEXING` is `true`).

## Exported functions

| Function                    | Trigger                                   | Purpose                                              |
| :-------------------------- | :---------------------------------------- | :--------------------------------------------------- |
| `executeIndexOperation`     | Firestore `onDocumentWritten`             | Creates, updates or deletes the record in Algolia    |
| `executeFullIndexOperation` | Cloud Tasks `onTaskDispatched`            | Indexes all existing documents, in batches of 250    |

## Configuration (`.env`)

| Param                | Type    | Default       | Description                                                                                          |
| :------------------- | :------ | :------------ | :--------------------------------------------------------------------------------------------------- |
| `LOCATION`           | string  | `us-central1` | Functions region.                                                                                    |
| `DATABASE_ID`        | string  | `(default)`   | Firestore database to monitor.                                                                       |
| `COLLECTION_PATH`    | string  | _required_    | Collection to monitor, e.g. `movies` or `users/{userId}/posts` (collection group).                   |
| `FIELDS`             | string  | _all_         | Comma separated list of fields to index.                                                             |
| `FORCE_DATA_SYNC`    | boolean | `false`       | Re-read the document before indexing (extra Firestore reads).                                        |
| `ALGOLIA_INDEX_NAME` | string  | _required_    | Target Algolia index.                                                                                |
| `ALGOLIA_APP_ID`     | string  | _required_    | Algolia application ID.                                                                              |
| `ALGOLIA_API_KEY`    | secret  | _required_    | Algolia key (`addObject`, `deleteObject`, `listIndexes`, `deleteIndex`, `editSettings`, `settings`). Do not use the Admin key. |
| `ALT_OBJECT_ID`      | string  | _doc id_      | Document field used as `objectID`; `(path)` uses the document path.                                  |
| `TRANSFORM_FUNCTION` | string  | _none_        | Name of an HTTPS function that transforms records before indexing (experimental).                    |
| `DO_FULL_INDEXING`   | boolean | `true`        | Index existing documents after each deployment.                                                      |

## What changed (Extension vs Package)

| Area                | Extension                                        | Package                                                          |
| :------------------ | :----------------------------------------------- | :--------------------------------------------------------------- |
| Triggers            | 1st Gen `firestore.document().onWrite`, `taskQueue` | 2nd Gen `onDocumentWritten`, `onTaskDispatched`               |
| Handler signature   | `(change, context)`                              | `({ change, context })` via the V1 destructuring shim            |
| Configuration       | `extension.yaml` params / `process.env`          | `defineString` / `defineBoolean` / `defineSecret` params         |
| API key             | `secret` param                                   | `defineSecret("ALGOLIA_API_KEY")`, bound to both functions       |
| IAM                 | `roles` in `extension.yaml`                      | `requiresRole("roles/datastore.user")`                           |
| Lifecycle           | `onInstall` / `onUpdate` / `onConfigure`         | `afterFirstDeploy` / `afterRedeploy` running `executeFullIndexOperation` |
| Processing state    | `runtime.setProcessingState`                     | Logged to Cloud Logging                                          |
| Task enqueue        | Needs `EXT_INSTANCE_ID`                          | Plain function name                                              |
| `FORCE_DATA_SYNC`   | `yes` / `no`                                     | `true` / `false`                                                 |
| Concurrency/cost    | 1 request per instance                           | `cpu: "gcf_gen1"` keeps single concurrency                       |

## Development

```bash
npm test         # jest
npm run compile  # tsc -> lib/
```
