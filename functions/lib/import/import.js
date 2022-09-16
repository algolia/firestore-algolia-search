"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fs = require("fs");
const util = require("util");
const config_1 = require("../config");
const extract_1 = require("../extract");
const index_1 = require("../index");
const logs = require("../logs");
const util_1 = require("../util");
const exists = util.promisify(fs.exists);
const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const sentDataToAlgolia = async (data) => {
    // Add or update new objects
    logs.info(`Preparing to send ${data.length} record(s) to Algolia.`);
    try {
        await index_1.index.partialUpdateObjects(data, { createIfNotExists: true });
        logs.info("Document(s) imported into Algolia");
    }
    catch (error) {
        logs.error(error);
    }
};
const doesPathMatchConfigCollectionPath = (path) => {
    const pathSegments = path.split("/");
    const collectionPathSegments = config_1.default.collectionPath.split("/");
    return collectionPathSegments.every((configSegment, i) => {
        // check if the configured path segment matches the path segment retrieved from firebase
        // if configured path has a placeholder pattern for document id, return true
        return (configSegment.match(/{.*?}/) !== null || configSegment === pathSegments[i]);
    });
};
const BATCH_MAX_SIZE = 9437184;
const processQuery = async (querySnapshot) => {
    let records = [];
    const docs = querySnapshot.docs;
    const timestamp = Date.now();
    for (const doc of docs) {
        // Skip over any docs pulled in from collectionGroup query that dont match config
        if (!doesPathMatchConfigCollectionPath(doc.ref.path)) {
            continue;
        }
        try {
            const payload = await extract_1.default(doc, timestamp);
            records.push(payload);
        }
        catch (e) {
            logs.warn("Payload size too big, skipping ...", e);
        }
        // We are sending batch updates to Algolia.  We need this to be less than 9 MB (9437184)
        const size = util_1.getObjectSizeInBytes(records);
        if (size >= BATCH_MAX_SIZE) {
            logs.info("Sending bulk Records to Algolia");
            sentDataToAlgolia(records);
            // reset records after sending
            records = [];
        }
    }
    // Send rest of the records that are still in the records array
    if (records.length > 0) {
        logs.info("Sending rest of the Records to Algolia");
        sentDataToAlgolia(records);
    }
};
const retrieveDataFromFirestore = async () => {
    const { projectId, collectionPath, algoliaAppId, algoliaIndexName } = config_1.default;
    const app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: `https://${projectId}.firebaseio.com`,
    });
    const db = app.firestore();
    const collectionPathParts = config_1.default.collectionPath.split("/");
    const collectionGroupPath = collectionPathParts[collectionPathParts.length - 1];
    let cursor;
    let cursorPositionFile = __dirname +
        `/from-${projectId}_${collectionPath}-to-${algoliaAppId}_${algoliaIndexName}`;
    if (await exists(cursorPositionFile)) {
        let cursorDocumentId = (await read(cursorPositionFile)).toString();
        cursor = await db.doc(cursorDocumentId).get();
        console.log(`Resuming import of Cloud Firestore Collection ${collectionPath} from document ${cursorDocumentId}.`);
    }
    let query = db.collectionGroup(collectionGroupPath).limit(200);
    do {
        if (cursor) {
            await write(cursorPositionFile, cursor.ref.path);
            query = query.startAfter(cursor);
        }
        const snapshot = await query.get();
        const docs = snapshot.docs;
        if (docs.length === 0) {
            break;
        }
        cursor = docs[docs.length - 1];
        try {
            await processQuery(snapshot);
        }
        catch (error) {
            console.error(error);
        }
    } while (true);
    try {
        await unlink(cursorPositionFile);
    }
    catch (e) {
        console.log(`Error unlinking journal file ${cursorPositionFile} after successful import: ${e.toString()}`);
    }
};
retrieveDataFromFirestore().catch((error) => {
    logs.error(error);
    process.exit(1);
});
