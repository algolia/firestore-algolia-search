"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const util_1 = require("../util");
(0, globals_1.describe)('getFields', () => {
    (0, globals_1.test)('empty string', () => {
        (0, globals_1.expect)((0, util_1.getFields)({ fields: '' })).toEqual([]);
    });
    (0, globals_1.test)('string with commas', () => {
        (0, globals_1.expect)((0, util_1.getFields)({ fields: 'field1,field2' })).toEqual([
            'field1',
            'field2',
        ]);
    });
    (0, globals_1.test)('string with commas and spaces', () => {
        (0, globals_1.expect)((0, util_1.getFields)({ fields: 'field1, field2 , field3,field4' })).toEqual([
            'field1',
            'field2',
            'field3',
            'field4',
        ]);
    });
});
