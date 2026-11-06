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

import {
  defineBoolean,
  defineSecret,
  defineString,
} from 'firebase-functions/params';

/*
 * Parameterized configuration (replaces the extension `params`).
 * Values are provided through `.env` files / CLI prompts at deploy time.
 */
export const databaseId = defineString('DATABASE_ID', {
  default: '(default)',
  description: 'Firestore database that contains the collection to monitor.',
});

export const collectionPath = defineString('COLLECTION_PATH', {
  description:
    'Path of the Cloud Firestore collection to monitor, e.g. "movies" or "movies/{id}/actors".',
  input: { text: { validationRegex: '^[^/]+(/[^/]+/[^/]+)*$', validationErrorMessage: 'Firestore collection paths must be an odd number of segments separated by slashes.' } },
});

export const fields = defineString('FIELDS', {
  default: '',
  description:
    'Comma separated list of fields to index. Leave blank to index all fields.',
});

export const forceDataSync = defineBoolean('FORCE_DATA_SYNC', {
  default: false,
  description:
    'Re-read the document from Firestore before indexing to mitigate race conditions (adds Firestore reads).',
});

export const algoliaIndexName = defineString('ALGOLIA_INDEX_NAME', {
  description: 'Name of the Algolia index where records are persisted.',
  input: { text: { nonEmpty: true } } as any,
});

export const algoliaAppId = defineString('ALGOLIA_APP_ID', {
  description: 'Algolia application ID.',
  input: { text: { nonEmpty: true } } as any,
});

export const algoliaApiKey = defineSecret('ALGOLIA_API_KEY');

export const altObjectId = defineString('ALT_OBJECT_ID', {
  default: '',
  description:
    'Alternative Firestore document property to use as the Algolia objectID. Use "(path)" for the document path.',
});

export const transformFunction = defineString('TRANSFORM_FUNCTION', {
  default: '',
  description:
    'Name of an HTTPS callable function used to transform data before it is saved to Algolia (experimental).',
});

export const doFullIndexing = defineBoolean('DO_FULL_INDEXING', {
  default: true,
  description:
    'Index existing documents of the collection after each deployment.',
});

export const location = defineString('LOCATION', {
  default: 'us-central1',
  description: 'Cloud Functions region.',
});
