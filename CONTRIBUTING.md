# Firebase Cloud Firestore

## Setup

### Installation
Install the Firebase tools in order to maintain this extension.
```
npm install -g firebase-tools@10.9.2
```

### Authentication
Login to Firebase to get permissions to the Firestore Database.
```
firebase login
```

### Extension Set up
Enable the extension tools for extension development.
```
firebase --open-sesame extdev
```

### Firebase Emulator
Install the Firestore Emulator to do local development.  This is useful for quick development without the need for a Cloud Firestore instance.
```
firebase init emulators
```

For Information on [installing FireBase emulators](https://firebase.google.com/docs/emulator-suite/install_and_configure)

#### Start Firestore Emulator
```
firebase ext:dev:emulators:start --test-params=test-params.env --project=algolia --import ./data
```



## Version update

When making changes to firestore, make sure to update the version. This is done by running with the right version:

```
npm run release 0.1.x
```

After the version has been bumped up, Test out extension on Firestore database

```
firebase ext:install ./firestore-algolia-search --project=algolia-b2ebc
```

If the testing is successful, then publish the Firestore extension and publish the npm package

#### Publish NPM Package
```
cd functions
git push --follow-tags
npm publish
```

#### Publish Firestore Extension
Make sure the below command is executed in the project root.  Also, `algolia-b2ebc` is the publish project for this extension.
```
firebase ext:dev:publish algolia/firestore-algolia-search --project=algolia-b2ebc
```
