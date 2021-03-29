'use strict';
/*
 * Copyright 2021 Algolia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

import config from '../config';
import extract from '../extract';
import * as logs from '../logs';

// configure algolia
const algolia = algoliasearch(config.algoliaAppId, config.algoliaAPIKey);
const index = algolia.initIndex(config.algoliaIndexName);// configure firebase

// initialize the application using the Google Credentials in the GOOGLE_APPLICATION_CREDENTIALS environment variable.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const database = admin.firestore();

const sentDataToAlgolia = (data: any[]) => {
  // Add or update new objects
  logs.info(`Preparing to send ${ data.length } record(s) to Algolia.`);
  index
    .saveObjects(data)
    .then(() => {
      logs.info('Document(s) imported into Algolia');
    })
    .catch(error => {
      logs.error(error);
    });
};

const retrieveDataFromFirestore = async () => {
  let records: any[] = [];
  const querySnapshot = await database.collection(config.collectionPath).get();

  // Use counter to limit how many records are stored in the array
  let counter = 0;
  querySnapshot.forEach((docSnapshot) => {
    // Capture the record and add to records array for later push to Algolia.
    records.push(extract(docSnapshot));
    counter++;

    // We are sending batch updates to Algolia.  We are using 5000 records as a limit.
    if (counter === 5000) {
      sentDataToAlgolia(records);

      // reset index and records after sending
      counter = 0;
      records = [];
    }
  });

  // Send rest of the records that are still in the records array
  if (records.length > 0) {
    sentDataToAlgolia(records);
  }
};

retrieveDataFromFirestore()
  .catch(error => {
    logs.error(error);
    process.exit(1);
  });
