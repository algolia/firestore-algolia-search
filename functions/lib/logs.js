"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldNotExist = exports.deleteIndex = exports.updateIndex = exports.createIndex = exports.info = exports.error = exports.start = exports.init = void 0;
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
const firebase_functions_1 = require("firebase-functions");
const config_1 = require("./config");
const obfuscatedConfig = Object.assign(Object.assign({}, config_1.default), { algoliaAPIKey: '********' });
exports.init = () => {
    firebase_functions_1.logger.info('Initializing extension with configuration', obfuscatedConfig);
};
exports.start = () => {
    firebase_functions_1.logger.info('Started extension execution with configuration', obfuscatedConfig);
};
exports.error = (err) => {
    firebase_functions_1.logger.error('Error when performing Algolia index', err);
};
exports.info = (...args) => {
    firebase_functions_1.logger.info(args);
};
exports.createIndex = (id, data) => {
    firebase_functions_1.logger.info(`Creating new Algolia index for document ${id}`, data);
};
exports.updateIndex = (id, data) => {
    firebase_functions_1.logger.info(`Updating existing Algolia index for document ${id}`, data);
};
exports.deleteIndex = (id) => {
    firebase_functions_1.logger.info(`Deleting existing Algolia index for document ${id}`);
};
exports.fieldNotExist = (field) => {
    firebase_functions_1.logger.warn(`The field "${field}" was specified in the extension config but was not found on collection data.`);
};
//# sourceMappingURL=logs.js.map