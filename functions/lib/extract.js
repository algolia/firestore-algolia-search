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
const config_1 = require("./config");
const logs = require("./logs");
const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
const getFields = () => config_1.default.fields ? config_1.default.fields.split(',') : [];
function extract(snapshot) {
    const payload = {
        objectID: snapshot.id,
    };
    const fields = getFields();
    if (fields.length === 0) {
        return Object.assign(Object.assign({}, snapshot.data()), payload);
    }
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i].replace(trim, '');
        const value = snapshot.get(field);
        if (value !== null) {
            payload[field] = value;
        }
        else {
            logs.fieldNotExist(field);
        }
    }
    return payload;
}
exports.default = extract;
//# sourceMappingURL=extract.js.map