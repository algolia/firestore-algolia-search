# Firebase Cloud Firestore Maintenance Guide

When making changes to firestore, make sure to update the version. This is done by running with the right version:

```
npm run release 0.1.x
```

After the version has been bumped up, Test out extension on Firestore database

```
firebase ext:install ./firestore-algolia-search --project=algolia-b2ebc
```

If the testing is successful, the publish the Firestore extension and publish the npm package

```
cd functions
git push --follow-tags
npm publish
```
