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
import * as readline from 'readline';

import config from '../config';
import extract from '../extract';
import * as logs from '../logs';
import { getObjectSizeInBytes, buildRequestOptions } from '../util';

const rl = readline.createInterface(process.stdin, process.stdout);

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
    .saveObjects(data, buildRequestOptions())
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
  const BATCH_MAX_SIZE = 9437184;
  const PAYLOAD_MAX_SIZE = 10240;
  querySnapshot.forEach((docSnapshot) => {
    // Capture the record and add to records array for later push to Algolia.
    // TODO: check if the record is less than or equal to 10kb, if larger than
    //  split the record using the Id
    // Add in config property to allow up to 100kb if plan allows it.
    const payload = extract(docSnapshot);
    if (getObjectSizeInBytes(payload) < PAYLOAD_MAX_SIZE) {
      records.push(extract(docSnapshot));
    } else {
      logs.warn('Payload size too big, skipping ...', payload);
    }

    // We are sending batch updates to Algolia.  We need this to be less than 9 MB (9437184)
    const size = getObjectSizeInBytes(records);
    if (size >= BATCH_MAX_SIZE) {
      logs.info('Sending bulk Records to Algolia');
      sentDataToAlgolia(records);

      // reset records after sending
      records = [];
    }
  });

  // Send rest of the records that are still in the records array
  if (records.length > 0) {
    logs.info('Sending rest of the Records to Algolia');
    sentDataToAlgolia(records);
  }
};

rl.question(`\nWARNING: The back fill process will index your entire collection which will impact your Search Operation Quota.  Please visit https://www.algolia.com/doc/faq/accounts-billing/how-algolia-count-records-and-operation/ for more details.  Do you want to continue? (y/N): `, function(answer) {
  const value = answer || 'n'
  if ('y' === value.toLowerCase()) {
    retrieveDataFromFirestore()
      .catch(error => {
        logs.error(error);
        process.exit(1);
      });
  }
  rl.close();
});

