'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectSizeInBytes = exports.getChangeType = exports.ChangeType = void 0;
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["CREATE"] = 0] = "CREATE";
    ChangeType[ChangeType["DELETE"] = 1] = "DELETE";
    ChangeType[ChangeType["UPDATE"] = 2] = "UPDATE";
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
exports.getChangeType = (change) => {
    if (!change.after.exists) {
        return ChangeType.DELETE;
    }
    if (!change.before.exists) {
        return ChangeType.CREATE;
    }
    return ChangeType.UPDATE;
};
exports.getObjectSizeInBytes = (object) => {
    const recordBuffer = Buffer.from(JSON.stringify(object));
    return recordBuffer.byteLength;
};
