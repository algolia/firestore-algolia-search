import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import testDocument, { documentID, testReleaseDate } from './data/document';
import { mockedSaveObject } from './mocks/search';

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv({ ...defaultEnvironment, FORCE_DATA_SYNC: 'yes' });
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

    test('functions runs with a create with force data sync.', async () => {
      const beforeSnapshot = globalThis.snapshot({}, documentID);
      const afterSnapshot = globalThis.snapshot(testDocument, documentID);

      const documentChange = globalThis.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const mockSnapshotGet = jest.fn().mockResolvedValue(afterSnapshot);
      afterSnapshot.ref.get = mockSnapshotGet;

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(infoMock).toBeCalledTimes(4);
      expect(infoMock).toBeCalledWith('Initializing extension with configuration', functionsConfig);
      expect(infoMock).toBeCalledWith('Started extension execution with configuration', functionsConfig);

      const payload = {
        'objectID': afterSnapshot.id,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        }
      };
      expect(infoMock).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockSnapshotGet).toBeCalledTimes(1);
      expect(mockedSaveObject).toBeCalledWith(payload);
    });

    test('functions runs with an update with force data sync.', async () => {
      const afterTestDocument = {
        ...testDocument,
        title: 'The Prison'
      };
      const beforeSnapshot = globalThis.snapshot(testDocument, documentID);
      const afterSnapshot = globalThis.snapshot(afterTestDocument, documentID);

      const mockSnapshotGet = jest.fn().mockResolvedValue(afterSnapshot);
      afterSnapshot.ref.get = mockSnapshotGet;

      const documentChange = globalThis.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(infoMock).toBeCalledTimes(3);
      expect(infoMock).toBeCalledWith('Started extension execution with configuration', functionsConfig);

      const payload = {
        'objectID': afterSnapshot.id,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        }
      };
      expect(infoMock).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockSnapshotGet).toBeCalledTimes(1);
      expect(mockedSaveObject).toBeCalledWith(payload);
    });
  });
});
