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
const functions = require("firebase-functions");
const algoliasearch_1 = require("algoliasearch");
const config_1 = require("./config");
const extract_1 = require("./extract");
const logs = require("./logs");
const util_1 = require("./util");
const version_1 = require("./version");
const client = algoliasearch_1.default(config_1.default.algoliaAppId, config_1.default.algoliaAPIKey);
client.addAlgoliaAgent('firestore_integration', version_1.version);
exports.index = client.initIndex(config_1.default.algoliaIndexName);
logs.init();
const handleCreateDocument = async (snapshot) => {
    try {
        const data = extract_1.default(snapshot);
        logs.createIndex(snapshot.id, data);
        await exports.index.saveObjects([data]);
    }
    catch (e) {
        logs.error(e);
    }
};
const handleUpdateDocument = async (before, after) => {
    try {
        const data = extract_1.default(after);
        logs.updateIndex(after.id, data);
        await exports.index.saveObjects([data]);
    }
    catch (e) {
        logs.error(e);
    }
};
const handleDeleteDocument = async (deleted) => {
    try {
        logs.deleteIndex(deleted.id);
        await exports.index.deleteObject(deleted.id);
    }
    catch (e) {
        logs.error(e);
    }
};
exports.executeIndexOperation = functions.handler.firestore.document
    .onWrite(async (change) => {
    logs.start();
    const changeType = util_1.getChangeType(change);
    switch (changeType) {
        case util_1.ChangeType.CREATE:
            await handleCreateDocument(change.after);
            break;
        case util_1.ChangeType.DELETE:
            await handleDeleteDocument(change.before);
            break;
        case util_1.ChangeType.UPDATE:
            await handleUpdateDocument(change.before, change.after);
            break;
        default: {
            throw new Error(`Invalid change type: ${changeType}`);
        }
    }
});
