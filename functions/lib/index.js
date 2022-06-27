'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeIndexOperation = exports.index = void 0;
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
const algoliasearch_1 = require("algoliasearch");
const functions = require("firebase-functions");
const config_1 = require("./config");
const extract_1 = require("./extract");
const logs = require("./logs");
const util_1 = require("./util");
const version_1 = require("./version");
const client = (0, algoliasearch_1.default)(config_1.default.algoliaAppId, config_1.default.algoliaAPIKey);
client.addAlgoliaAgent('firestore_integration', version_1.version);
exports.index = client.initIndex(config_1.default.algoliaIndexName);
logs.init();
const handleCreateDocument = async (after, timestamp) => {
    try {
        if (config_1.default.algoliaMergeParentChild === 'yes') {
            // Sync with data from Firestore to avoid race conditions
            const updatedSnapshot = await after.ref.get();
            await processParentChildRecord(null, updatedSnapshot, timestamp);
        }
        else if (config_1.default.forceDataSync === 'yes') {
            const updatedSnapshot = await after.ref.get();
            const data = await (0, extract_1.default)(updatedSnapshot, 0);
            logs.createIndex(updatedSnapshot.id, data);
            logs.info('force sync data: execute saveObject');
            await exports.index.saveObject(data);
        }
        else {
            const data = await (0, extract_1.default)(after, timestamp);
            logs.debug({
                ...data
            });
            logs.createIndex(after.id, data);
            await exports.index.partialUpdateObject(data, { createIfNotExists: true });
        }
    }
    catch (e) {
        logs.error(e);
    }
};
const handleUpdateDocument = async (before, after, timestamp) => {
    try {
        if (config_1.default.algoliaMergeParentChild === 'yes') {
            // Sync with data from Firestore to avoid race conditions
            const updatedSnapshot = await after.ref.get();
            await processParentChildRecord(before, updatedSnapshot, timestamp);
        }
        else if (config_1.default.forceDataSync === 'yes') {
            const updatedSnapshot = await after.ref.get();
            const data = await (0, extract_1.default)(updatedSnapshot, 0);
            logs.updateIndex(updatedSnapshot.id, data);
            logs.info('force sync data: execute saveObject');
            await exports.index.saveObject(data);
        }
        else {
            if ((0, util_1.areFieldsUpdated)(config_1.default, before, after)) {
                logs.debug('Detected a change, execute indexing');
                const beforeData = await before.data();
                // loop through the after data snapshot to see if any properties were removed
                const undefinedAttrs = Object.keys(beforeData).filter(key => after.get(key) === undefined);
                // if no attributes were removed, then use partial update of the record.
                if (undefinedAttrs.length === 0) {
                    const data = await (0, extract_1.default)(after, timestamp);
                    logs.updateIndex(after.id, data);
                    logs.debug('execute partialUpdateObject');
                    await exports.index.partialUpdateObject(data, { createIfNotExists: true });
                }
                // if an attribute was removed, then use save object of the record.
                else {
                    const data = await (0, extract_1.default)(after, 0);
                    logs.updateIndex(after.id, data);
                    logs.debug('execute saveObject');
                    await exports.index.saveObject(data);
                }
            }
        }
    }
    catch (e) {
        logs.error(e);
    }
};
const handleDeleteDocument = async (deleted) => {
    logs.debug('Detected a delete change');
    try {
        logs.deleteIndex(deleted.id);
        await exports.index.deleteObject(deleted.id);
    }
    catch (e) {
        logs.error(e);
    }
};
const processParentChildRecord = async (before, after, timestamp) => {
    // Get data from filtered fields defined.
    const data = await (0, extract_1.default)(after, timestamp);
    // capture any deleted fields from the firestore document
    const undefinedAttrs = await async function () {
        if (before) {
            // If before does not exists or before exists but no data change was detected,
            // then return with no further execution.
            if ((0, util_1.areFieldsUpdated)(config_1.default, before, after)) {
                logs.debug('Detected a change, execute indexing');
                const beforeData = await before.data();
                // loop through the after data snapshot to see if any properties were removed
                return Object.keys(beforeData).filter(key => after.get(key) === undefined);
            }
        }
        return [];
    }();
    logs.debug('undefinedAttrs are ', undefinedAttrs);
    // if algolia attribute name is set, then this collection is being merged with a possible algolia record using this
    // attribute name to set this data
    if (config_1.default.algoliaChildAttributeName) {
        // remove the objectID property since this data will be added to a parent algolia record.
        delete data.objectID;
        // TODO: research a better way to get the root document id.
        const parentId = after.ref.parent.parent.id;
        logs.debug('Parent id is ', parentId);
        // Make a request to Algolia to get record
        const algoliaRecord = await exports.index.getObject(parentId);
        logs.debug(algoliaRecord);
        // if Algolia record exists then retrieve the array assigned to the attribute name
        if (algoliaRecord) {
            const attributeData = algoliaRecord[config_1.default.algoliaChildAttributeName];
            // check if value exists
            if (attributeData) {
                const updatedAlgoliaRecord = attributeData.map(attrData => {
                    logs.debug('Checking for a match... ', attrData.objectID, data.objectID);
                    // check if the update data object Id matches the item from Algolia
                    if (attrData.objectID === data.objectID) {
                        const mergeData = {
                            ...attrData,
                            ...data
                        };
                        // loop through deleted fields and remove the fields from the data object before sending to Algolia.
                        undefinedAttrs.forEach(attr => {
                            delete mergeData[attr];
                        });
                        return mergeData;
                    }
                    else {
                        return attrData;
                    }
                });
                logs.debug('saveObject: updatedAlgoliaRecord ', updatedAlgoliaRecord);
                await exports.index.saveObject(updatedAlgoliaRecord);
            }
            else {
                // loop through deleted fields and remove the fields from the data object before sending to Algolia.
                undefinedAttrs.forEach(attr => {
                    delete data[attr];
                });
                // set array with data as the first element.
                algoliaRecord[config_1.default.algoliaChildAttributeName] = [
                    data
                ];
                logs.debug('saveObject: algoliaRecord ', algoliaRecord);
                await exports.index.saveObject(algoliaRecord);
            }
        }
        else {
            logs.warn('Algolia record does not exist for ', parentId);
        }
    }
    else {
        // loop through deleted fields and remove the fields from the data object before sending to Algolia.
        undefinedAttrs.forEach(attr => {
            delete data[attr];
        });
        logs.debug({
            data
        });
        logs.debug('saveObject: data ', data);
        await exports.index.saveObject(data);
    }
};
// get updated document from Firestore
// extract data
// if sub collection attribute name
//  get parent id
// get Algolia record
// if Algolia record
//  if sub collection attribute name
//    get object from algolia record using sub collection attribute name
//    loop through algolia record and update fields from data
//    loop through removed fields and remove from Algolia record
//    set algolia record with data on the attribute set
//  else
//    loop through algolia record and update fields from data
//    loop through removed fields and remove from Algolia record
// save algolia record
exports.executeIndexOperation = functions.handler.firestore.document
    .onWrite(async (change, context) => {
    logs.start();
    const eventTimestamp = Date.parse(context.timestamp);
    const changeType = (0, util_1.getChangeType)(change);
    switch (changeType) {
        case util_1.ChangeType.CREATE:
            await handleCreateDocument(change.after, eventTimestamp);
            break;
        case util_1.ChangeType.DELETE:
            await handleDeleteDocument(change.before);
            break;
        case util_1.ChangeType.UPDATE:
            await handleUpdateDocument(change.before, change.after, eventTimestamp);
            break;
        default: {
            throw new Error(`Invalid change type: ${changeType}`);
        }
    }
});
