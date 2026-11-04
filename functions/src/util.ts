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

import { Change } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import { altObjectId, fields as fieldsParam } from './config';
import * as logs from './logs';
import { valueProcessor } from './processors';

export enum ChangeType {
  CREATE,
  DELETE,
  UPDATE,
}

export const getChangeType = (change: Change<DocumentSnapshot>) => {
  if (!change.after.exists) {
    return ChangeType.DELETE;
  }
  if (!change.before.exists) {
    return ChangeType.CREATE;
  }
  return ChangeType.UPDATE;
};

export const getObjectID = (snapshot: DocumentSnapshot): string => {
  const altId = altObjectId.value();
  return altId ? altId === '(path)' ? snapshot.ref.path : snapshot.get(altId) : snapshot.id;
}

export const getObjectSizeInBytes = (object: [] | {}) => {
  const recordBuffer = Buffer.from(JSON.stringify(object));
  return recordBuffer.byteLength;
};

export const getFields = (fields: string) =>
  fields ? fields.split(/[ ,]+/) : [];

export const areFieldsUpdated = (
  before: DocumentSnapshot,
  after: DocumentSnapshot
) => {
  const fields = getFields(fieldsParam.value());

  logs.debug(`fields: ${ fields }`);
  // If fields are not configured, then execute update record.
  if (fields.length === 0) {
    return true;
  }

  // If fields are configured, then check the before and after data for the specified fields.
  //  If any changes detected, then execute update record.
  for (const field of fields) {
    const [ , beforeFieldValue ] = valueProcessor(field, before.get(field));
    const [ , afterFieldValue ] = valueProcessor(field, after.get(field));
    if (JSON.stringify(beforeFieldValue) !== JSON.stringify(afterFieldValue)) {
      return true;
    }
  }
  return false;
};

export const isValidValue = (value) => {
  return typeof value !== undefined && value !== null;
};

/**
 * Determines if a collection path represents a collection group query by checking for wildcard patterns.
 *
 * Collection group queries use wildcard syntax like "users/{userId}/posts" to query
 * all subcollections with a given name across the database:
 *   - "users/{userId}/posts" → queries all "posts" subcollections across all users
 *   - "organizations/{orgId}/members" → queries all "members" subcollections
 *
 * Specific paths like "organizations/acme/members" should NOT be treated as collection groups:
 *   - "posts" → top-level collection
 *   - "organizations/acme/members" → specific subcollection under a specific document
 *
 * @param collectionPath - The configured collection path
 * @returns true if the path contains wildcard patterns (e.g., {userId}), false otherwise
 */
export const isCollectionGroupPath = (collectionPath: string): boolean => {
  // Check for wildcard patterns like {userId}, {docId}, etc.
  return /\{[^}]+\}/.test(collectionPath);
};
