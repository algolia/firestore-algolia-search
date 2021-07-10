'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
const node_fetch_1 = require("node-fetch");
const config_1 = require("./config");
const logs = require("./logs");
exports.default = async (payload) => {
    if (config_1.default.transformFunction) {
        logs.debug(`https://${config_1.default.location}-${config_1.default.projectId}.cloudfunctions.net/${config_1.default.transformFunction}`);
        try {
            const response = await node_fetch_1.default(`https://${config_1.default.location}-${config_1.default.projectId}.cloudfunctions.net/${config_1.default.transformFunction}`, {
                method: 'post',
                body: JSON.stringify({ data: payload }),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await (response === null || response === void 0 ? void 0 : response.json());
            logs.debug('response?.json()', data.result);
            return data.result;
        }
        catch (e) {
            logs.error(e);
        }
    }
    return payload;
};
