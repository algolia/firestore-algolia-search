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

enum ChangeType {
  CREATE,
  DELETE,
  UPDATE,
}

export const getChangeType = (
  change: functions.Change<DocumentSnapshot>
) => {
  if (!change.after.exists) {
    return ChangeType.DELETE;
  }
  if (!change.before.exists) {
    return ChangeType.CREATE;
  }
  return ChangeType.UPDATE;
};

const getClient = () => algoliaSearch(config.algoliaAppId, config.algoliaAPIKey);
const getIndex = () => getClient().initIndex(config.algoliaIndexName);

// Adding header to better track users using this extension.
const requestOptions = {
  headers: {
    'User-Agent': 'Algolia Firebase Ext. v0.0.1; Algolia Search JS v4.*.*',
  },
};

logs.init();

const handleCreateDocument = async (
  snapshot: DocumentSnapshot
) => {
  const data = extract(snapshot);

  try {
    logs.createIndex(snapshot.id, data);
    await getIndex().saveObjects([ data ], requestOptions);
  } catch (e) {
    logs.error(e);
  }
};

const handleUpdateDocument = async (
  before: DocumentSnapshot,
  after: DocumentSnapshot
) => {
  const data = extract(after);

  try {
    logs.updateIndex(after.id, data);
    await getIndex().saveObjects([ data ], requestOptions);
  } catch (e) {
    logs.error(e);
  }
};

const handleDeleteDocument = async (
  deleted: DocumentSnapshot,
) => {
  try {
    logs.deleteIndex(deleted.id);
    await getIndex().deleteObject(deleted.id, requestOptions);
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
