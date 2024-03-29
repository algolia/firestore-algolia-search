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
// eslint-disable-next-line import/no-unresolved
import { GeoPoint, DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { isValidValue } from './util';

const processObject = objectVal => {
  const payload = {};
  for (const [ key, val ] of Object.entries(objectVal)) {
    const [ field, value ] = processValue(key, val);
    if (isValidValue(value)) {
      payload[field] = value;
    }
  }
  return payload;
};

const processValue = (field, value) => {
  if (value instanceof DocumentReference) {
    return [ field, processDocumentReference(value) ];
  } else if (value instanceof GeoPoint) {
    // Algolia has a prescribed field name for Geo data.
    return [ '_geoloc', processGeoPoint(value) ];
  } else if (value instanceof Timestamp) {
    return [ field, processTimestamp(value) ];
  } else if (value instanceof Array) {
    return [ field, processArray(value) ];
  } else if (value instanceof Object) {
    return [ field, processObject(value) ];
  }
  return [ field, value ];
};

const processArray = (arrayVal: Array<any>) => {
  return arrayVal.map((val, index) => {
    if (val instanceof Object) {
      const [ _, value ] = processValue(index, val);
      return value;
    }
    return val;
  });
};

const processTimestamp = (timestampVal: Timestamp) => {
  return timestampVal.toDate().getTime();
};

const processDocumentReference = (referenceVal: DocumentReference) => {
  return referenceVal.path;
};

const processGeoPoint = (geoPointVal: GeoPoint) => {
  return {
    lat: geoPointVal.latitude,
    lng: geoPointVal.longitude,
  };
};

/**
 * The data processor will process the Firestore document.  It will loop through the fields and process the values.
 * The value can be simple or complex types that are supported by Firestore.
 *
 * @param data
 */
export const dataProcessor = data => {
  return processObject(data);
};

/**
 * The field processor will process the Firestore document field value.
 *
 * @param field
 * @param value
 */
export const valueProcessor = (field, value) => {
  return processValue(field, value);
};
