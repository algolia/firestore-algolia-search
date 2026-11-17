# firestore-algolia-search

Index a Cloud Firestore collection into [Algolia](https://algolia.com) using
2nd Gen Cloud Functions. This is the Function Kit version of the
`firestore-algolia-search` Firebase Extension.

## Installation

```bash
cd functions
npm install firestore-algolia-search
```

Re-export the functions from your `functions/src/index.ts`:

```ts
export * from "firestore-algolia-search";
```

And deploy:

```bash
firebase deploy --only functions
```

The IAM roles `roles/datastore.user`, `roles/eventarc.eventReceiver`,
`roles/run.invoker` and `roles/cloudtasks.enqueuer` are declared in code and
granted at deploy time. A full indexing run is triggered automatically after the first deploy and
after every redeploy if you set `DO_FULL_INDEXING` to `true` (default `false`).

> [!NOTE]
> On the first deploy, the roles above are granted at the same moment the full
> indexing task is queued. IAM changes can take a few minutes to propagate, so the
> task may be rejected with a `403`:
> ```
> The request was not authenticated [...] The IAM principal lacks {run.routes.invoke} permission.
> ```
> If you see this in the `executeFullIndexOperation` logs, wait a few minutes and run the
> lifecycle hook again:
>
> ```bash
> firebase functions:lifecycle:run afterFirstDeploy CODEBASE_NAME   # or: afterRedeploy
> ```

## Exported functions

| Function                    | Trigger                                   | Purpose                                              |
| :-------------------------- | :---------------------------------------- | :--------------------------------------------------- |
| `executeIndexOperation`     | Firestore `onDocumentWritten`             | Creates, updates or deletes the record in Algolia    |
| `executeFullIndexOperation` | Cloud Tasks `onTaskDispatched`            | Indexes all existing documents, in batches of 250    |

## Configuration
### `.env` values

| Param                | Type    | Default       | Description                                                                          |
| :------------------- | :------ | :------------ | :------------------------------------------------------------------------------------|
| `LOCATION`           | string  | `us-central1` | Functions region.                                                                    |
| `DATABASE_ID`        | string  | `(default)`   | Firestore database to monitor.                                                       |
| `COLLECTION_PATH`    | string  | _required_    | Collection to monitor, e.g. `movies` or `users/{userId}/posts` (collection group).   |
| `FIELDS`             | string  | _all_         | Comma separated list of fields to index.                                             |
| `FORCE_DATA_SYNC`    | string  | `false`       | `true` / `false` (`yes` / `no` also accepted). Re-read the document before indexing. |
| `ALGOLIA_APP_ID`     | string  | _required_    | Algolia application ID.                                                              |
| `ALGOLIA_INDEX_NAME` | string  | _required_    | Target Algolia index.                                                                |
| `ALT_OBJECT_ID`      | string  | _doc id_      | Document field used as `objectID`; `(path)` uses the document path.                  |
| `TRANSFORM_FUNCTION` | string  | _none_        | Name of an HTTPS function that transforms records before indexing (experimental).    |
| `DO_FULL_INDEXING`   | boolean | `false`       | Index existing documents after each deployment.                                      |

### Secrets

- `ALGOLIA_API_KEY`: An Algolia API Key with the following ACLs: `addObject`, `deleteObject`.

## Migrating from the extension

The extension's functions are named `ext-<instance-id>-*`, so they don't clash
with the ones from this package. Until the extension is uninstalled, both
copies run and every write is indexed twice.

1. Export the extension's configuration:
   ```bash
   firebase ext:export
   ```
   Copy the values from `extensions/<instance-id>.env` into `functions/.env`.
2. Set the Algolia API key. The extension stored it under its own name, so it
   has to be set again:
   ```bash
   firebase functions:secrets:set ALGOLIA_API_KEY
   ```
3. Re-export the functions and deploy, as in [Installation](#installation).
4. Uninstall the extension:
   ```bash
   firebase ext:uninstall <instance-id>
   ```

Leave `DO_FULL_INDEXING=false` if the index is already up to date: records
keep the same `objectID` as long as `ALT_OBJECT_ID` doesn't change. Set it to
`true` for one deploy if you need a full resync, for example if the extension
was uninstalled before the new functions were deployed.

### What changed (Extension vs Package)

| Area                | Extension                                        | Package                                                          |
| :------------------ | :----------------------------------------------- | :--------------------------------------------------------------- |
| Triggers            | 1st Gen `firestore.document().onWrite`, `taskQueue` | 2nd Gen `onDocumentWritten`, `onTaskDispatched`               |
| Handler signature   | `(change, context)`                              | `({ change, context })` via the V1 destructuring shim            |
| Configuration       | `extension.yaml` params / `process.env`          | `defineString` / `defineBoolean` / `defineSecret` params         |
| API key             | `secret` param                                   | `defineSecret("ALGOLIA_API_KEY")`, bound to both functions       |
| IAM                 | `roles` in `extension.yaml`                      | four `requiresRole(...)` calls (see above)                       |
| Lifecycle           | `onInstall` / `onUpdate` / `onConfigure`         | `afterFirstDeploy` / `afterRedeploy`                             |
| Processing state    | `runtime.setProcessingState`                     | Logged to Cloud Logging                                          |
| Task enqueue        | Needs `EXT_INSTANCE_ID`                          | Plain function name                                              |
| `DO_FULL_INDEXING`  | Required choice (Yes/No)                         | Default `false`; runs after every redeploy when `true`           |
| Concurrency/cost    | 1 request per instance                           | `cpu: "gcf_gen1"` keeps the single concurrency                   |

## Development

```bash
npm test         # jest
npm run compile  # tsc -> lib/
```
