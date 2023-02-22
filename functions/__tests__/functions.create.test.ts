import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import testDocument, {testReleaseDate} from './data/document';
import {mockedPartialUpdateObject} from "./mocks/search";

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

    test('functions runs with a create', async () => {
      const beforeSnapshot = globalThis.snapshot({}, 'document/1');
      const afterSnapshot = globalThis.snapshot(testDocument, 'document/1');

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
      const payload = {
        'objectID': afterSnapshot.id,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        },
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      }
      expect(infoMock).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );

      expect(mockedPartialUpdateObject).toBeCalledWith(payload,  { createIfNotExists: true });
    });
  });
});
