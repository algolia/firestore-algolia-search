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
import { EventContext } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/v1/providers/firestore';

import config from './config';
import extract from './extract';
import { areFieldsUpdated, ChangeType, getChangeType } from './util';
import { version } from './version';
import * as logs from './logs';
import DocumentData = firestore.DocumentData;
// import { getExtensions } from 'firebase-admin/lib/extensions';
//
// const DOCS_PER_INDEXING = 250;

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
      await index.saveObject(data);
    } else {
      const data = await extract(snapshot, timestamp);

      logs.debug({
        ...data
      });

      logs.createIndex(snapshot.id, data);
      await index.partialUpdateObject(data, { createIfNotExists: true });
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
      await index.saveObject(data);
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
          await index.partialUpdateObject(data, { createIfNotExists: true });
        }
        // if an attribute was removed, then use save object of the record.
        else {
          const data = await extract(after, 0);

          // delete null value attributes before saving.
          undefinedAttrs.forEach(attr => delete data[attr]);

          logs.updateIndex(after.id, data);
          logs.debug('execute saveObject');
          await index.saveObject(data);
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
    logs.deleteIndex(deleted.id);
    await index.deleteObject(deleted.id);
  } catch (e) {
    logs.error(e);
  }
};

// export const executeIndexOperation = functions.handler.firestore.document
//   .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext): Promise<void> => {
export const executeIndexOperation = functions.firestore
  .document(config.collectionPath)
  .onWrite(async (change, context: EventContext): Promise<void> => {
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

// export const executeFullIndexOperation = functions.tasks
//   .taskQueue()
//   .onDispatch(async (data: any) => {
//     const runtime = getExtensions().runtime();
//     if (!config.doFullIndexing) {
//       await runtime.setProcessingState(
//         "PROCESSING_COMPLETE",
//         'Existing documents were not indexed because "Indexing existing documents?" is configured to false. ' +
//         "If you want to run a full reindex, reconfigure this instance."
//       );
//       return;
//     }
//     const offset = (data["offset"] as number) ?? 0;
//     const pastSuccessCount = (data["successCount"] as number) ?? 0;
//     const pastErrorCount = (data["errorCount"] as number) ?? 0;
//     // We also track the start time of the first invocation, so that we can report the full length at the end.
//     const startTime = (data["startTime"] as number) ?? Date.now();
//
//     // const snapshot = await firestore().collection(process.env.COLLECTION_PATH)
//     //   .offset(offset)
//     //   .limit(DOCS_PER_INDEXING)
//     //   .get();
//     // // Since we will be writing many docs to Firestore, use a BulkWriter for better performance.
//     // const writer = admin.firestore().bulkWriter();
//     // const translations = await Promise.allSettled(
//     //   snapshot.docs.map((doc) => {
//     //     return handleExistingDocument(doc, writer);
//     //   })
//     // );
//     // // Close the writer to commit the changes to Firestore.
//     // await writer.close();
//     // const newSucessCount =
//     //   pastSuccessCount +
//     //   translations.filter((p) => p.status === "fulfilled").length;
//     // const newErrorCount =
//     //   pastErrorCount +
//     //   translations.filter((p) => p.status === "rejected").length;
//     //
//     // if (snapshot.size == DOCS_PER_BACKFILL) {
//     //   // Stil have more documents to translate, enqueue another task.
//     //   logs.enqueueNext(offset + DOCS_PER_BACKFILL);
//     //   const queue = getFunctions().taskQueue(
//     //     "fstranslatebackfill",
//     //     process.env.EXT_INSTANCE_ID
//     //   );
//     //   await queue.enqueue({
//     //     offset: offset + DOCS_PER_BACKFILL,
//     //     successCount: newSucessCount,
//     //     errorCount: newErrorCount,
//     //     startTime: startTime,
//     //   });
//     // } else {
//     //   // No more documents to translate, time to set the processing state.
//     //   logs.backfillComplete(newSucessCount, newErrorCount);
//     //   if (newErrorCount == 0) {
//     //     return await runtime.setProcessingState(
//     //       "PROCESSING_COMPLETE",
//     //       `Successfully translated ${newSucessCount} documents in ${
//     //         Date.now() - startTime
//     //       }ms.`
//     //     );
//     //   } else if (newErrorCount > 0 && newSucessCount > 0) {
//     //     return await runtime.setProcessingState(
//     //       "PROCESSING_WARNING",
//     //       `Successfully translated ${newSucessCount} documents, ${newErrorCount} errors in ${
//     //         Date.now() - startTime
//     //       }ms. See function logs for specific error messages.`
//     //     );
//     //   }
//     //   return await runtime.setProcessingState(
//     //     "PROCESSING_FAILED",
//     //     `Successfully translated ${newSucessCount} documents, ${newErrorCount} errors in ${
//     //       Date.now() - startTime
//     //     }ms. See function logs for specific error messages.`
//     //   );
//     // }
//   });

