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
import transform from './transform';
import { getObjectSizeInBytes, getFields, isValidValue } from './util';

// import the Split Function Caller
import split from './split'

const PAYLOAD_MAX_SIZE = 102400;

// New error msg for arrays size exceded
const ARRAY_PAYLOAD_TOO_LARGE_ERR_MSG = 'Array Record is too large.';

const PAYLOAD_TOO_LARGE_ERR_MSG = 'Record is too large.';
const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

const getPayload = async (snapshot: DocumentSnapshot): Promise<any> => {
    let payload: {
    [key: string]: boolean | string | number | any[];
  } = {
    objectID: snapshot.id,
    path: snapshot.ref.path
  };

  const fields = getFields(config);
  if (fields.length === 0) {
    payload = {
      ...dataProcessor(snapshot.data()),
      ...payload
    };
  } else {

    // Fields have been defined by user.  Start pulling data from the document to create payload
    // to send to Algolia.
    fields.forEach(item => {
      let firebaseField = item.replace(trim, '');
      const [ field, value ] = valueProcessor(firebaseField, snapshot.get(firebaseField));

      if (isValidValue(value)) {
        payload[field] = value;
      } else {
        logs.fieldNotExist(firebaseField);
      }
    });
  }

  // adding the objectId in the return to make sure to restore to original if changed in the post processing.

  //! IMPLEMENTAR AQUI LA DETECCION DE SPLIT Y DIVIDIR CON SPLIT ARRAY SI PROCEDE

  if (payload[config.splitKey]) {
    // Document must be splitted
    const splittedPayload: any[] = await split(payload)

    return splittedPayload.map(sp => transform(sp))

  } else return transform(payload); // Regular return
}

export default async function extract(snapshot: DocumentSnapshot, timestamp: Number): Promise<any> {
  // Check payload size and make sure its within limits before sending for indexing
  const payload = await getPayload(snapshot);

  // Check if getPayload returns an array of records or a simple record
  // Also is posible to check it with the boolean splitKey as follows: if (snapshot[config.splitKey]) ...
  // Also both can be done in same if statement to ensure
  if (Array.isArray(payload)) {

    // Checking each record size independently
    const sizes: number[] = payload.map(p => getObjectSizeInBytes(p))
    const maxs = sizes.every(s => s < PAYLOAD_MAX_SIZE)

    if (maxs) {
      if (timestamp === 0) {
        return payload;
      } else {
        return payload.map(p => ({
          ...p,
          lastmodified: {
            _operation: 'IncrementSet',
            value: timestamp,
          },
        }))
      }
    } else {
      throw new Error(ARRAY_PAYLOAD_TOO_LARGE_ERR_MSG);
    }
  } else {
    // do it normaly
    if (getObjectSizeInBytes(payload) < PAYLOAD_MAX_SIZE) {
      if (timestamp === 0) {
        return payload;
      } else {
        return {
          ...payload,
          lastmodified: {
            _operation: 'IncrementSet',
            value: timestamp,
          },
        };
      }
    } else {
      throw new Error(PAYLOAD_TOO_LARGE_ERR_MSG);
    }
  }

}
