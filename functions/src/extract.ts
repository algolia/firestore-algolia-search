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

import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import config from './config';
import * as logs from './logs';
import { dataProcessor, valueProcessor } from './processors';
import { getObjectSizeInBytes, getFields, isValidValue } from './util';

const PAYLOAD_MAX_SIZE = 102400;
const PAYLOAD_TOO_LARGE_ERR_MSG = 'Record is too large.';
const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

const getPayload = (snapshot: DocumentSnapshot) => {
  const payload: {
    [key: string]: boolean | string | number;
  } = {
    objectID: snapshot.id,
  };

  const fields = getFields(config);
  if (fields.length === 0) {
    return {
      ...dataProcessor(snapshot.data()),
      ...payload,
    };
  }

  // Fields have been defined by user.  Start pulling data from the document to create payload
  // to send to Algolia.
  fields.forEach(item => {
    let firebaseField = item.replace(trim, '');
    const [field, value] = valueProcessor(firebaseField, snapshot.get(firebaseField));

    logs.debug('field', field);
    logs.debug('value', value);

    if (isValidValue(value)) {
      payload[field] = value;
    } else {
      logs.fieldNotExist(firebaseField);
    }
  });

  return payload;
}

export default function extract(snapshot: DocumentSnapshot, timestamp: Number): object {
  // Check payload size and make sure its within limits before sending for indexing
  const payload = getPayload(snapshot);
  if (getObjectSizeInBytes(payload) < PAYLOAD_MAX_SIZE) {
    return {
      ...payload,
      lastmodified: {
        _operation: 'IncrementSet',
        value: timestamp,
      },
    };
  } else {
    throw new Error(PAYLOAD_TOO_LARGE_ERR_MSG);
  }
}
