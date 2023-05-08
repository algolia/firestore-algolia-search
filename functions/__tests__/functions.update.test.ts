import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import testDocument, { documentID, testReleaseDate } from './data/document';
import { mockedPartialUpdateObject } from './mocks/search';

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv({ ...defaultEnvironment, FIELDS: 'title,awards,meta,popular' });
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

    test('functions runs with an update', async () => {
      const beforeSnapshot = globalThis.snapshot(testDocument, documentID);
      const afterSnapshot = globalThis.snapshot({
        ...testDocument,
        title: 'The Prison'
      }, documentID);

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
        'popular': false,
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      };
      expect(infoMock).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });

    test('functions runs with an update with a boolean data type set as true', async () => {
      const beforeSnapshot = globalThis.snapshot(testDocument, documentID);
      const afterSnapshot = globalThis.snapshot({
        ...testDocument,
        popular: true
      }, documentID);

      const documentChange = functionsTest.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(infoMock).toBeCalledTimes(2);
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
        'popular': true,
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      };
      expect(infoMock).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });
  });
});
