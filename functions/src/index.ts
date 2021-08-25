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
import * as functions from 'firebase-functions';
import { EventContext, Change } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import config from './config';
import extract from './extract';
import * as logs from './logs';
import { ChangeType, getChangeType, areFieldsUpdated } from './util';
import { version } from './version';

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
    const data = await extract(snapshot, timestamp);
    if (!data) {
      return;
    }
    logs.debug({
      ...data
    });

    logs.createIndex(snapshot.id, data);
    await index.partialUpdateObject(data, { createIfNotExists: true });
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
    if (areFieldsUpdated(config, before, after)) {
      logs.debug('Detected a change, execute indexing');

      const data = await extract(after, timestamp);
      if (!data) {
        return;
      }
      logs.updateIndex(after.id, data);
      await index.partialUpdateObject(data, { createIfNotExists: true });
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
