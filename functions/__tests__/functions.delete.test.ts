import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import testDocument, {documentID} from './data/document';
import {mockedDeleteObject} from "./mocks/search";

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv(defaultEnvironment);
    config = require('../src/config').default;
  });

  describe('functions.executeIndexOperation', () => {
    const logger = globalThis.mockLogger();
    const infoMock = logger.info;
    let functionsConfig;

    beforeEach(async () => {
      jest.clearAllMocks();
      functionsTest = functionsTestInit();
      functionsConfig = config;
    });

    test('functions runs with a deletion', async () => {
      const beforeSnapshot = globalThis.snapshot(testDocument, documentID);
      const afterSnapshot = globalThis.snapshot({}, documentID);

      const documentChange = globalThis.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(infoMock).toBeCalledTimes(3);
      expect(infoMock).toBeCalledWith(
        'Started extension execution with configuration',
        functionsConfig
      );
      expect(infoMock).toBeCalledWith(
        `Deleting existing Algolia index for document ${ afterSnapshot.id }`
      );
      expect(mockedDeleteObject).toBeCalledWith(afterSnapshot.id);
    });
  });
});
