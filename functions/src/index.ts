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

import * as functions from 'firebase-functions';
import algoliaSearch from 'algoliasearch';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import config from './config';
import extract from './extract';
import * as logs from './logs';
import { ChangeType, getChangeType } from './util';

const client = algoliaSearch(
  config.algoliaAppId,
  config.algoliaAPIKey,
);

client.addAlgoliaAgent('firestore_integration', '0.1.3');

export const index = client.initIndex(config.algoliaIndexName);

logs.init();

const handleCreateDocument = async (
  snapshot: DocumentSnapshot
) => {
  try {
    const data = extract(snapshot);

    logs.createIndex(snapshot.id, data);
    await index.saveObjects([ data ]);
  } catch (e) {
    logs.error(e);
  }
};

const handleUpdateDocument = async (
  before: DocumentSnapshot,
  after: DocumentSnapshot
) => {
  try {
    const data = extract(after);

    logs.updateIndex(after.id, data);
    await index.saveObjects([ data ]);
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
  .onWrite(async (change): Promise<void> => {
    logs.start();

    const changeType = getChangeType(change);
    switch (changeType) {
      case ChangeType.CREATE:
        await handleCreateDocument(change.after);
        break;
      case ChangeType.DELETE:
        await handleDeleteDocument(change.before);
        break;
      case ChangeType.UPDATE:
        await handleUpdateDocument(change.before, change.after);
        break;
      default: {
        throw new Error(`Invalid change type: ${ changeType }`);
      }
    }
  });
