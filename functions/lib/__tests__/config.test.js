"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const yaml = require("js-yaml");
const mocked_env_1 = require("mocked-env");
let restoreEnv;
let extensionYaml;
let extensionParams;
const environment = {
    LOCATION: 'us-central1',
    DATASET_ID: 'my_dataset',
    TABLE_ID: 'my_table',
};
describe('extension config', () => {
    beforeAll(() => {
        extensionYaml = yaml.safeLoad(fs_1.readFileSync(path_1.resolve(__dirname, '../../extension.yaml'), 'utf8'));
        extensionParams = extensionYaml.params.reduce((obj, param) => {
            obj[param.param] = param;
            return obj;
        }, {});
    });
    beforeEach(() => {
        jest.resetModules();
        restoreEnv = mocked_env_1.default(environment);
    });
    afterEach(() => restoreEnv());
    test('config loaded from environment variables', () => {
        const env = {
            location: environment.LOCATION,
            datasetId: environment.DATASET_ID,
            tableId: environment.TABLE_ID,
        };
        expect(config()).toMatchSnapshot(env);
    });
    // DATASET_ID
    describe('config.datasetId', () => {
        test('param exists', () => {
            const extensionParam = extensionParams['DATASET_ID'];
            expect(extensionParam).toMatchSnapshot();
        });
        describe('validationRegex', () => {
            test('does not allow empty strings', () => {
                const { validationRegex } = extensionParams['DATASET_ID'];
                expect(Boolean(''.match(new RegExp(validationRegex)))).toBeFalsy();
            });
            test('does not allow spaces', () => {
                const { validationRegex } = extensionParams['DATASET_ID'];
                expect(Boolean('foo bar,'.match(new RegExp(validationRegex)))).toBeFalsy();
            });
            test('allows a alphanumeric underscore ids', () => {
                const { validationRegex } = extensionParams['DATASET_ID'];
                expect(Boolean('my_dataset'.match(new RegExp(validationRegex)))).toBeTruthy();
            });
        });
    });
    // TABLE_ID
    describe('config.tableId', () => {
        test('param exists', () => {
            const extensionParam = extensionParams['TABLE_ID'];
            expect(extensionParam).toMatchSnapshot();
        });
        describe('validationRegex', () => {
            test('does not allow empty strings', () => {
                const { validationRegex } = extensionParams['TABLE_ID'];
                expect(Boolean(''.match(new RegExp(validationRegex)))).toBeFalsy();
            });
            test('does not allow spaces', () => {
                const { validationRegex } = extensionParams['TABLE_ID'];
                expect(Boolean('foo bar,'.match(new RegExp(validationRegex)))).toBeFalsy();
            });
            test('allows a alphanumeric underscore ids', () => {
                const { validationRegex } = extensionParams['TABLE_ID'];
                expect(Boolean('my_table'.match(new RegExp(validationRegex)))).toBeTruthy();
            });
        });
    });
});
//# sourceMappingURL=config.test.js.map