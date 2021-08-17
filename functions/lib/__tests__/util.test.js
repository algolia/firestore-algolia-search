"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const util_1 = require("../util");
globals_1.describe('getFields', () => {
    globals_1.test('empty string', () => {
        globals_1.expect(util_1.getFields({ fields: '' })).toEqual([]);
    });
    globals_1.test('string with commas', () => {
        globals_1.expect(util_1.getFields({ fields: 'field1,field2' })).toEqual([
            'field1',
            'field2',
        ]);
    });
    globals_1.test('string with commas and spaces', () => {
        globals_1.expect(util_1.getFields({ fields: 'field1, field2 , field3,field4' })).toEqual([
            'field1',
            'field2',
            'field3',
            'field4',
        ]);
    });
});
