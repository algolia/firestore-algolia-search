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

const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
const getFields = () => config.fields ? config.fields.split(',') : [];

export default function extract(snapshot: DocumentSnapshot): object {
  const payload: {
    [key: string]: boolean | string | number;
  } = {
    objectID: snapshot.id,
  };

  const fields = getFields();
  if (fields.length === 0) {
    return {
      ...snapshot.data(),
      ...payload,
    };
  }

  fields.forEach(item => {
    const field = item.replace(trim, '');
    const value = snapshot.get(field);

    if (value !== null) {
      payload[field] = value;
    } else {
      logs.fieldNotExist(field);
    }
  });

  return payload;
}
