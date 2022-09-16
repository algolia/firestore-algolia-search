'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logs = require("./logs");
const processors_1 = require("./processors");
const transform_1 = require("./transform");
const util_1 = require("./util");
const PAYLOAD_MAX_SIZE = 102400;
const PAYLOAD_TOO_LARGE_ERR_MSG = 'Record is too large.';
const trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
const getPayload = async (snapshot) => {
    let payload = {
        objectID: snapshot.id,
        path: snapshot.ref.path
    };
    const fields = util_1.getFields(config_1.default);
    if (fields.length === 0) {
        payload = {
            ...processors_1.dataProcessor(snapshot.data()),
            ...payload
        };
    }
    else {
        // Fields have been defined by user.  Start pulling data from the document to create payload
        // to send to Algolia.
        fields.forEach(item => {
            let firebaseField = item.replace(trim, '');
            const [field, value] = processors_1.valueProcessor(firebaseField, snapshot.get(firebaseField));
            if (util_1.isValidValue(value)) {
                payload[field] = value;
            }
            else {
                logs.fieldNotExist(firebaseField);
            }
        });
    }
    // adding the objectId in the return to make sure to restore to original if changed in the post processing.
    return transform_1.default(payload);
};
async function extract(snapshot, timestamp) {
    // Check payload size and make sure its within limits before sending for indexing
    const payload = await getPayload(snapshot);
    if (util_1.getObjectSizeInBytes(payload) < PAYLOAD_MAX_SIZE) {
        if (timestamp === 0) {
            return {
                ...payload
            };
        }
        else {
            return {
                ...payload,
                lastmodified: {
                    _operation: 'IncrementSet',
                    value: timestamp,
                },
            };
        }
    }
    else {
        throw new Error(PAYLOAD_TOO_LARGE_ERR_MSG);
    }
}
exports.default = extract;
