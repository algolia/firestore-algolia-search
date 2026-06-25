# Firebase Cloud Firestore

## Setup

### Installation
Install the Firebase tools in order to maintain this extension.
```
npm install -g firebase-tools
```

### Authentication
Login to Firebase to get permissions to the Firestore Database.
```
firebase login
```

### Install dependencies
Install the root and `functions` dependencies.
```
npm install
```

> **Note (Node 18+/20+/22):** The root `prepare` script runs `husky install`. On newer
> Node versions, `husky` v7 can fail with `Error: Cannot find module './'`. If `npm install`
> fails on the `prepare` step, install while skipping lifecycle scripts and then install the
> functions dependencies manually:
> ```
> npm install --ignore-scripts
> cd functions && npm install
> ```
> See the [Troubleshooting](#troubleshooting) section for details.

### Firebase Emulator
Install the Firestore Emulator to do local development.  This is useful for quick development without the need for a Cloud Firestore instance.
```
firebase init emulators
```
More information on [installing FireBase emulators](https://firebase.google.com/docs/emulator-suite/install_and_configure)

#### Start Firestore Emulator
The repo ships an `emulator:start` script that imports the seed data from `data/`:
```
npm run emulator:start
```
This is equivalent to:
```
firebase emulators:start --import=data
```

#### Testing the extension locally
1. Install the extension into your local config so the emulator has an instance to run:
   ```
   firebase ext:install . --project=<your-project-id>
   ```
   This writes an instance entry into `firebase.json` and creates
   `extensions/<instance-id>.env` and `extensions/<instance-id>.secret.local`.
2. Start the emulator:
   ```
   npm run emulator:start
   ```
3. Open the Emulator UI (default http://127.0.0.1:4000/firestore) and add, update, or
   delete a document in the collection you configured (e.g. `movies`).
4. Watch the Functions logs. A successful create looks like:
   ```
   Creating new Algolia index for document <docId>
   Finished "<region>-ext-<instance>-executeIndexOperation" in <N>ms
   ```
5. Confirm the record appears in your Algolia index.

> **Note:** Even when running in the emulator, the extension sends data to the **real Algolia
> API**. Use a dedicated test index so you do not pollute production data.

## Releasing a New Version

Below is the full end-to-end process for releasing a new version of the extension.

### Prerequisites

- You are logged in via `firebase login`
- You have access to the **`algolia-b2ebc`** Firebase project (the registered publisher project for the `algolia` Extensions publisher). If you don't have access, ask a team member to add you via [Firebase Console](https://console.firebase.google.com/) > `algolia-b2ebc` > Project Settings > Users and permissions.
- You have committed all your changes following [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix:`, `feat:`, `chore:`)

### Step 1 — Bump the version

Run the release script with your target version:

```bash
npm run release -- --release-as <version>
```

For example:
```bash
npm run release -- --release-as 1.4.0
```

You can also use semver keywords:
```bash
npm run release -- --release-as patch   # 1.3.0 -> 1.3.1
npm run release -- --release-as minor   # 1.3.0 -> 1.4.0
npm run release -- --release-as major   # 1.3.0 -> 2.0.0
```

This uses `standard-version` and will automatically:

1. **Bump the version** in all tracked files (configured in `.versionrc`):
   - `package.json`
   - `package-lock.json`
   - `extension.yaml`
   - `functions/package.json`
   - `functions/package-lock.json`
   - `functions/src/version.ts`
2. **Update `CHANGELOG.md`** from your conventional commit messages
3. **Create a release commit** (e.g. `chore(release): 1.4.0`)
4. **Create a git tag** (e.g. `v1.4.0`)

### Step 2 — Test the extension on a Firebase project

Install the extension locally against a real Firebase project to verify everything works:

```bash
firebase ext:install . --project=algolia-b2ebc
```

This will:

1. **Check project permissions** — Verify your IAM policy is correct and required APIs (`firebaseextensions.googleapis.com`) are enabled.
2. **Upload the extension source code** — Package and upload your local extension code.
3. **Show a summary for review** — Display the extension name, version, license, resources (Cloud Functions), external services, required APIs, and IAM roles. You will be prompted to confirm with `Continue? (Y/n)`.
4. **Create a new extension instance** — You'll be asked to name the instance (e.g. `firestore-algolia-search-xxxx`).
5. **Configure the extension** — You'll be prompted to enter values for each parameter:
   - **Database ID**: The Firestore database to monitor (default: `(default)`)
   - **Collection Path**: The Firestore collection path to watch (e.g. `movies`)
   - **Indexable Fields** *(optional)*: Comma-separated list of fields to index, or leave blank for all fields
   - **Force Data Sync** *(optional)*: Whether to force a re-read from Firestore before sending to Algolia (`No` / `Yes`)
   - **Algolia Index Name**: The name of the target Algolia index (e.g. `movies`)
   - **Algolia Application Id**: Your Algolia App ID (found at [API keys tab](https://dashboard.algolia.com/account/api-keys))
   - **Algolia API Key**: A dedicated API key with `addObject`, `deleteObject`, `listIndexes`, `deleteIndex`, `editSettings`, and `settings` permissions. **Do not use the Admin API key.** You'll be asked where to store the secret (select `Google Cloud Secret Manager`).
   - **Alternative Object Id** *(optional)*: Use a different document property or `(path)` as the Algolia objectID
   - **Transform Function Name** *(optional)*: A Cloud Function name for data transformation before indexing
   - **Full Index existing documents?**: Whether to index all existing documents on install (`Yes` / `No`)
   - **Cloud Functions location**: The region to deploy to (e.g. `us-central1`, `europe-west1`)

6. **Deploy the extension** — Cloud Functions, Task Queues, and Secret Manager resources will be created.

Once deployed, verify the extension works by adding/updating/deleting documents in the configured collection and checking your Algolia index.

> You can also validate purely locally with the Firestore Emulator before deploying — see
> [Testing the extension locally](#testing-the-extension-locally).

### Step 3 — Push the release to GitHub

After testing is successful, push the release commit and tag:

```bash
git push --follow-tags
```

This pushes both the release commit (e.g. `chore(release): 1.4.0`) and the version tag (e.g. `v1.4.0`) to the remote.

### Step 4 — Publish the Firebase Extension

From the **project root**, upload the extension to the Firebase Extensions Hub:

```bash
firebase ext:dev:upload algolia/firestore-algolia-search --project=algolia-b2ebc
```

- `algolia/firestore-algolia-search` is the **publisher ID / extension ID** pair
- `--project=algolia-b2ebc` is the **publisher project** registered with the `algolia` publisher profile — this is **not interchangeable** with any other project
- If you don't have access to `algolia-b2ebc`, contact your team to be added. You can still
  use your **own** Firebase project for `firebase ext:install` testing, but the final
  `ext:dev:upload algolia/...` must target the registered publisher project.

After this command succeeds, the new version will be available on the [Firebase Extensions Hub](https://extensions.dev/extensions/algolia/firestore-algolia-search).

### Quick Reference

```bash
# 1. Bump version
npm run release -- --release-as <version>

# 2. Test locally (real project or emulator)
firebase ext:install . --project=algolia-b2ebc

# 3. Push to GitHub
git push --follow-tags

# 4. Publish
firebase ext:dev:upload algolia/firestore-algolia-search --project=algolia-b2ebc
```

## Troubleshooting

Issues encountered during local development and publishing, with their fixes.

### `npm install` fails on the `husky install` (prepare) step
**Symptom:**
```
> husky install && cd functions && npm install
Error: Cannot find module './'
  ... code: 'MODULE_NOT_FOUND'
```
**Cause:** The root `prepare` script runs `husky install`. `husky` v7 is not compatible with
newer Node.js versions (observed on Node 22).

**Fix:** Install while skipping lifecycle scripts, then install the functions dependencies
manually:
```bash
npm install --ignore-scripts
cd functions && npm install
```
The `husky install` step only sets up local git commit-lint hooks, so skipping it does not
affect the extension or the release process. Consider upgrading `husky` to v9+ in a future
release.

### `Could not start Firestore Emulator, port taken`
**Symptom:**
```
⚠  firestore: Port 8080 is not open on localhost ...
Error: Could not start Firestore Emulator, port taken.
```
**Cause:** Another process (often a leftover emulator) is already bound to the port.

**Fix:** Either kill the process holding the port:
```bash
lsof -ti :8080 | xargs kill -9
```
or change the port in `firebase.json` under `emulators.firestore.port` (e.g. `8081`).

### `TypeError: The "path" argument must be of type string. Received undefined`
**Symptom:** While starting the emulator:
```
TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined
    at .../firebase-functions/lib/v1/providers/firestore.js:96:33
⬢  functions: Failed to load function definition from source ...
```
**Cause:** The emulator loads the function code **twice**: once as the **extension instance**
(with the parameter env vars from `extensions/<instance>.env`, which succeeds) and once as
**standalone Cloud Functions** (from the `functions` block in `firebase.json`, which has no
`COLLECTION_PATH` set, so the Firestore trigger path resolves to `undefined`). The error comes
from the second, standalone load.

**Resolution:** This error is **non-blocking noise**. The extension instance still initializes
correctly and the emulator reports `All emulators ready!`. Confirm you see lines like:
```
✔  functions[<region>-ext-<instance>-executeIndexOperation]: firestore function initialized.
```
Do **not** remove the `functions` block from `firebase.json` to silence it — the Functions
emulator requires that block, and removing it produces
`No valid functions configuration detected in firebase.json`. Simply ignore the `TypeError`
and proceed with testing.

### Emulator warns about the Node.js version
**Symptom:**
```
⚠  functions: You've requested "node" version "22", but the standalone Firebase CLI comes
   with bundled Node "20".
```
**Cause:** The standalone Firebase CLI ships its own bundled Node (20). The emulator runs your
functions on that bundled runtime regardless of your system Node version. The `runtime: nodejs22`
in `extension.yaml` only applies to the **deployed** Cloud Functions, not the emulator.

**Resolution:** Informational only — safe to ignore. If you want the emulator to use your system
Node, install Firebase via npm (`npm install -g firebase-tools`) instead of the standalone CLI.

### `Function 'executeFullIndexOperation' is missing a trigger in extension.yaml`
**Symptom:**
```
⚠  Function 'executeFullIndexOperation' is missing a trigger in extension.yaml ...
⚠  Unsupported function type on ext-...-executeFullIndexOperation ...
i  functions[...executeFullIndexOperation]: function ignored because the unknown emulator
   does not exist or is not running.
```
**Cause:** `executeFullIndexOperation` uses a `taskQueueTrigger`, which the emulator cannot run.

**Resolution:** Expected and non-blocking. The task-queue function works when **deployed**; it is
simply skipped in the emulator. You can still fully test the document-triggered
`executeIndexOperation`.

### Local test artifacts and what to commit
`firebase ext:install` writes local files for emulator testing:
- An instance entry under `extensions` in `firebase.json`
- `extensions/<instance-id>.env`
- `extensions/<instance-id>.secret.local`

The `extensions/` directory is already covered by `.gitignore`, but the **`firebase.json`
instance entry is not**. Revert the `firebase.json` change before committing your release so
the repo's `firebase.json` stays clean (only the `functions` and `emulators` blocks should
remain).

### Publisher access (`algolia-b2ebc`)
`firebase ext:dev:upload algolia/firestore-algolia-search` must target the registered publisher
project `algolia-b2ebc`. If you get a permissions error, ask a team member to grant you access
to that project. You may use any project you own for `firebase ext:install` testing, but the
final publish step requires the registered publisher project.
