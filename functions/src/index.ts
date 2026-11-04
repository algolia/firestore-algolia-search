/* eslint-disable import/no-unresolved */
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
import type { SearchIndex } from 'algoliasearch';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { requiresRole } from 'firebase-functions/v2';
import { afterFirstDeploy, afterRedeploy } from 'firebase-functions/lifecycle';
import { expr } from 'firebase-functions/params';
import { DocumentData, DocumentSnapshot, FieldPath, getFirestore, Query } from 'firebase-admin/firestore';
import { getFunctions } from 'firebase-admin/functions';
import { getApps, initializeApp } from 'firebase-admin/app';

import config, { algoliaApiKey, collectionPath, databaseId, location } from './config';
import extract from './extract';
import { areFieldsUpdated, ChangeType, getChangeType, getObjectID, isCollectionGroupPath } from './util';
import { version } from './version';
import * as logs from './logs';

const DOCS_PER_INDEXING = 250;

// Required IAM role (replaces `roles` in extension.yaml): read/write Firestore.
requiresRole('roles/datastore.user');

// Algolia client and Firebase Admin are created lazily: parameter values are
// not available at module load time.
let algoliaIndex: SearchIndex | undefined;
export const getIndex = (): SearchIndex => {
  if (!algoliaIndex) {
    logs.init();
    const client = algoliaSearch(config.algoliaAppId, config.algoliaAPIKey);
    client.addAlgoliaAgent('firestore_integration', version);
    algoliaIndex = client.initIndex(config.algoliaIndexName);
  }
  return algoliaIndex;
};

const getDb = () => {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore(config.databaseId);
};

const handleCreateDocument = async (
  snapshot: DocumentSnapshot,
  timestamp: Number
) => {
  try {
    const forceDataSync = config.forceDataSync;
    if (forceDataSync) {
      const updatedSnapshot = await snapshot.ref.get();
      const data = await extract(updatedSnapshot, 0);
      logs.createIndex(updatedSnapshot.id, data);
      logs.info('force sync data: execute saveObject');
      await getIndex().saveObject(data);
    } else {
      const data = await extract(snapshot, timestamp);

      logs.debug({
        ...data,
      });

      logs.createIndex(snapshot.id, data);
      await getIndex().partialUpdateObject(data, { createIfNotExists: true });
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
    if (forceDataSync) {
      const updatedSnapshot = await after.ref.get();
      const data = await extract(updatedSnapshot, 0);
      logs.updateIndex(updatedSnapshot.id, data);
      logs.info('force sync data: execute saveObject');
      await getIndex().saveObject(data);
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
          await getIndex().partialUpdateObject(data, { createIfNotExists: true });
        }
        // if an attribute was removed, then use save object of the record.
        else {
          const data = await extract(after, 0);

          // delete null value attributes before saving.
          undefinedAttrs.forEach(attr => delete data[attr]);

          logs.updateIndex(after.id, data);
          logs.debug('execute saveObject');
          await getIndex().saveObject(data);
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
    logs.deleteIndex(getObjectID(config, deleted),);
    await getIndex().deleteObject(getObjectID(config, deleted),);
  } catch (e) {
    logs.error(e);
  }
};

export const executeIndexOperation = onDocumentWritten(
  {
    document: expr`${ collectionPath }/{documentID}`,
    database: databaseId,
    region: location,
    secrets: [algoliaApiKey],
    cpu: 'gcf_gen1',
  },
  async ({ change, context }): Promise<void> => {
    logs.start();

    const eventTimestamp = Date.parse(context.timestamp);
    const changeType = getChangeType(change as any);
    switch (changeType) {
      case ChangeType.CREATE:
        await handleCreateDocument(change.after as DocumentSnapshot, eventTimestamp);
        break;
      case ChangeType.DELETE:
        await handleDeleteDocument(change.before as DocumentSnapshot);
        break;
      case ChangeType.UPDATE:
        await handleUpdateDocument(change.before as DocumentSnapshot, change.after as DocumentSnapshot, eventTimestamp);
        break;
      default: {
        throw new Error(`Invalid change type: ${ changeType }`);
      }
    }
  }
);

export const executeFullIndexOperation = onTaskDispatched(
  {
    region: location,
    secrets: [algoliaApiKey],
    memory: '1GiB',
    timeoutSeconds: 540,
    cpu: 'gcf_gen1',
    retryConfig: { maxAttempts: 3 },
  },
  async ({ data }: { data: any }) => {
    logs.init()
    logs.info('config.doFullIndexing', config.doFullIndexing);
    if (!config.doFullIndexing) {
      logs.info(
        'Existing documents were not indexed because DO_FULL_INDEXING is false. ' +
        'Set it to true and redeploy to run a full reindex.'
      );
      return;
    }

    logs.info('config.collectionPath', config.collectionPath);
    const docId = (data ?? {})['docId'] ?? null;
    const pastSuccessCount = ((data ?? {})['successCount'] as number) ?? 0;
    const pastErrorCount = ((data ?? {})['errorCount'] as number) ?? 0;
    // We also track the start time of the first invocation, so that we can report the full length at the end.
    const startTime = ((data ?? {})['startTime'] as number) ?? Date.now();
    let query: Query;

    const isCollectionGroup = isCollectionGroupPath(config.collectionPath);
    logs.info('Is Collection Group?', isCollectionGroup);
    if (isCollectionGroup) {
      query = getDb()
        .collectionGroup(config.collectionPath.split('/').pop());
    } else {
      query = getDb()
        .collection(config.collectionPath);
    }
    query = query.limit(DOCS_PER_INDEXING);

    logs.debug('docId?', docId);
    if (docId) {
      let queryCursor = query.where(FieldPath.documentId(), '==', docId);
      logs.debug('queryCursor?', queryCursor);

      const querySnapshot = await queryCursor.get();
      logs.debug('querySnapshot?', querySnapshot);
      logs.debug('querySnapshot.docs?', querySnapshot.docs);
      querySnapshot.docs.forEach(doc => query = query.startAfter(doc));
    }

    logs.debug('query', query);
    const snapshot = await query.get();
    const promises = await Promise.allSettled(
      snapshot.docs.map((doc) => extract(doc, startTime))
    );
    logs.debug('promises.length', promises.length);
    (promises as any).forEach(v => logs.info('v', v));
    const records = (promises as any)
      .filter(v => v.status === "fulfilled")
      .map(v => v.value);

    logs.info('records.length', records.length);
    const responses = await getIndex().saveObjects(records, {
      autoGenerateObjectIDIfNotExist: true,
    });
    logs.debug('responses.objectIDs', responses.objectIDs);
    logs.info('responses.taskIDs', responses.taskIDs);

    const newSuccessCount = pastSuccessCount + records.length;
    const newErrorCount = pastErrorCount;

    if (snapshot.size === DOCS_PER_INDEXING) {
      const newCursor = snapshot.docs[snapshot.size - 1];
      const queue = getFunctions().taskQueue(
        `locations/${config.location}/functions/executeFullIndexOperation`
      );
      await queue.enqueue({
        docId: isCollectionGroup ? newCursor.ref.path : newCursor.id,
        successCount: newSuccessCount,
        errorCount: newErrorCount,
        startTime: startTime,
      });
    } else {
      // No more documents to index, time to set the processing state.
      logs.fullIndexingComplete(newSuccessCount, newErrorCount);
      const elapsed = Date.now() - startTime;
      if (newErrorCount === 0) {
        logs.info(`Successfully indexed ${ newSuccessCount } documents in ${ elapsed }ms.`);
      } else {
        logs.warn(`Indexed ${ newSuccessCount } documents, ${ newErrorCount } errors in ${ elapsed }ms.`);
      }
    }
  }
);

// Run a full indexing after the first deployment and after every redeploy
// (replaces `lifecycleEvents` in extension.yaml).
afterFirstDeploy({ task: { function: 'executeFullIndexOperation' } });
afterRedeploy({ task: { function: 'executeFullIndexOperation' } });
