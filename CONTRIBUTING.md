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

### Firebase Emulator
Install the Firestore Emulator to do local development.  This is useful for quick development without the need for a Cloud Firestore instance.
```
firebase init emulators
```
More information on [installing FireBase emulators](https://firebase.google.com/docs/emulator-suite/install_and_configure)

#### Start Firestore Emulator
```
firebase emulators:start --project=algolia --import ./data
```

## Version update

When making changes to firestore, make sure to update the version. This is done by running with the right version:

```
npm run release 1.x.x
```

After the version has been bumped up, Test out extension on Firestore database

```
firebase ext:install . --project=algolia-b2ebc
```

If the testing is successful, then push the new tags and publish the Firestore extension

#### Push new version tag
```
git push --follow-tags
```

#### Publish Firestore Extension
Make sure the below command is executed in the project root.  Also, `algolia-b2ebc` is the publish project for this extension.
```
firebase ext:dev:upload algolia/firestore-algolia-search --project=algolia-b2ebc
```
