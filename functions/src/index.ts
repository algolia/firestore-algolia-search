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

import algoliaSearch from 'algoliasearch';
import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { EventContext, Change } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import config from './config';
import extract from './extract';
import * as logs from './logs';
import { ChangeType, getChangeType, areFieldsUpdated } from './util';
import { version } from './version';
import DocumentData = firestore.DocumentData;

// import the IDs Generation Function Caller
import idsgen from './idsgen';

const client = algoliaSearch(
  config.algoliaAppId,
  config.algoliaAPIKey,
);

client.addAlgoliaAgent('firestore_integration', version);

export const index = client.initIndex(config.algoliaIndexName);

logs.init();

const handleCreateDocument = async (
  snapshot: DocumentSnapshot,
  timestamp: Number
) => {
  try {
    const forceDataSync = config.forceDataSync;
    if (forceDataSync === 'yes') {
      const updatedSnapshot = await snapshot.ref.get();
      const data = await extract(updatedSnapshot, 0);
      logs.createIndex(updatedSnapshot.id, data);
      logs.info('force sync data: execute saveObject');

      // If extract returns is an Array plural function is called insted singular
      if (Array.isArray(data)) {
        await index.saveObjects(data);
      } else {
        await index.saveObject(data);
      }

    } else {
      const data = await extract(snapshot, timestamp);

      logs.debug({
        ...data
      });
      
      logs.createIndex(snapshot.id, data);

      // If extract returns is an Array plural function is called insted singular
      if (Array.isArray(data)) {
        await index.partialUpdateObjects(data, { createIfNotExists: true });
      } else {
        await index.partialUpdateObject(data, { createIfNotExists: true });
      }

    }
  } catch (e) {
    logs.error(e);
  }
};

const handleUpdateDocument = async (
  before: DocumentSnapshot,
  after: DocumentSnapshot,
  timestamp: Number
) => {
  try {
    const forceDataSync = config.forceDataSync;
    if (forceDataSync === 'yes') {
      const updatedSnapshot = await after.ref.get();
      const data = await extract(updatedSnapshot, 0);
      logs.updateIndex(updatedSnapshot.id, data);
      logs.info('force sync data: execute saveObject');

      // If extract returns is an Array plural function is called insted singular
      if (Array.isArray(data)) {
        await index.saveObjects(data);
      } else {
        await index.saveObject(data);
      }

    } else {
      if (areFieldsUpdated(config, before, after)) {
        logs.debug('Detected a change, execute indexing');

        const beforeData: DocumentData = await before.data();
        // loop through the after data snapshot to see if any properties were removed
        const undefinedAttrs = Object.keys(beforeData).filter(key => after.get(key) === undefined || after.get(key) === null);
        logs.debug('undefinedAttrs', undefinedAttrs);
        // if no attributes were removed, then use partial update of the record.
        if (undefinedAttrs.length === 0) {
          const data = await extract(after, timestamp);
          logs.updateIndex(after.id, data);
          logs.debug('execute partialUpdateObject');

          // If extract returns is an Array plural function is called insted singular
          if (Array.isArray(data)) {
            await index.partialUpdateObjects(data, { createIfNotExists: true });
          } else {
            await index.partialUpdateObject(data, { createIfNotExists: true });
          }

        }
        // if an attribute was removed, then use save object of the record.
        else {
          const data = await extract(after, 0);

          // delete null value attributes before saving.
          undefinedAttrs.forEach(attr => delete data[attr]);

          logs.updateIndex(after.id, data);
          logs.debug('execute saveObject');

          // If extract returns is an Array plural function is called insted singular
          if (Array.isArray(data)) {
            await index.saveObjects(data);
          } else {
            await index.saveObject(data);
          }

        }
      }
    }
  } catch (e) {
    logs.error(e);
  }
};

const handleDeleteDocument = async (
  deleted: DocumentSnapshot,
) => {
  try {
    // Catch document id and data
    const id = deleted.id
    const document = deleted.data()

    // check if document is splitted
    if (document[config.splitKey]) {
      // generate the id list for deleting algolia records
      const ids: string[] = await idsgen(document)
      logs.deleteIndices(ids);
      await index.deleteObjects(ids);
    } else {
      // Delete the firebase document id in algolia index
      logs.deleteIndex(id);
      await index.deleteObject(id);
    }

  } catch (e) {
    logs.error(e);
  }
};

export const executeIndexOperation = functions.handler.firestore.document
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext): Promise<void> => {
    logs.start();

    const eventTimestamp = Date.parse(context.timestamp);
    const changeType = getChangeType(change);
    switch (changeType) {
      case ChangeType.CREATE:
        await handleCreateDocument(change.after, eventTimestamp);
        break;
      case ChangeType.DELETE:
        await handleDeleteDocument(change.before);
        break;
      case ChangeType.UPDATE:
        await handleUpdateDocument(change.before, change.after, eventTimestamp);
        break;
      default: {
        throw new Error(`Invalid change type: ${ changeType }`);
      }
    }
  });
