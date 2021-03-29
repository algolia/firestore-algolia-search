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
exports.executeIndexOperation = exports.getChangeType = void 0;
const functions = require("firebase-functions");
const algoliasearch_1 = require("algoliasearch");
const config_1 = require("./config");
const extract_1 = require("./extract");
const logs = require("./logs");
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["CREATE"] = 0] = "CREATE";
    ChangeType[ChangeType["DELETE"] = 1] = "DELETE";
    ChangeType[ChangeType["UPDATE"] = 2] = "UPDATE";
})(ChangeType || (ChangeType = {}));
exports.getChangeType = (change) => {
    if (!change.after.exists) {
        return ChangeType.DELETE;
    }
    if (!change.before.exists) {
        return ChangeType.CREATE;
    }
    return ChangeType.UPDATE;
};
const getClient = () => algoliasearch_1.default(config_1.default.algoliaAppId, config_1.default.algoliaAPIKey);
const getIndex = () => getClient().initIndex(config_1.default.algoliaIndexName);
// Adding header to better track users using this extension.
const requestOptions = {
    headers: {
        'User-Agent': 'Algolia Firebase Ext. v0.0.1; Algolia Search JS v4.*.*',
    },
};
logs.init();
const handleCreateDocument = async (snapshot) => {
    const data = extract_1.default(snapshot);
    try {
        logs.createIndex(snapshot.id, data);
        await getIndex().saveObjects([data], requestOptions);
    }
    catch (e) {
        logs.error(e);
    }
};
const handleUpdateDocument = async (before, after) => {
    const data = extract_1.default(after);
    try {
        logs.updateIndex(after.id, data);
        await getIndex().saveObjects([data], requestOptions);
    }
    catch (e) {
        logs.error(e);
    }
};
const handleDeleteDocument = async (deleted) => {
    try {
        logs.deleteIndex(deleted.id);
        await getIndex().deleteObject(deleted.id, requestOptions);
    }
    catch (e) {
        logs.error(e);
    }
};
exports.executeIndexOperation = functions.handler.firestore.document
    .onWrite(async (change) => {
    logs.start();
    const changeType = exports.getChangeType(change);
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
            throw new Error(`Invalid change type: ${changeType}`);
        }
    }
});
//# sourceMappingURL=index.js.map