import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import { mocked } from 'ts-jest/utils';
import { mockConsoleInfo } from './__mocks__/console';
import testDocument, { testReleaseDate } from './data/document';

jest.mock('algoliasearch');

const defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: 'title,awards,meta,popular'
};

export const mockExport = (document, data) => {
  const ref = require('../src/index').executeIndexOperation;
  let functionsTest = functionsTestInit();

  const wrapped = functionsTest.wrap(ref);
  return wrapped(document, data);
};

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  const mockedAlgoliasearch = mocked(algoliasearch, true);
  const mockedAddAlgoliaAgent = jest.fn();

  const mockedPartialUpdateObject = jest.fn();
  const mockedSaveObjects = jest.fn();
  const mockedDeleteObject = jest.fn();
  const mockedInitIndex = jest.fn((): {
    deleteObject: jest.Mock<any, any>;
    saveObjects: jest.Mock<any, any>;
    partialUpdateObject: jest.Mock<any, any>
  } => ({
    saveObjects: mockedSaveObjects,
    deleteObject: mockedDeleteObject,
    partialUpdateObject: mockedPartialUpdateObject
  }));

  // @ts-ignore
  mockedAlgoliasearch.mockReturnValue({
    addAlgoliaAgent: mockedAddAlgoliaAgent,
    // @ts-ignore
    initIndex: mockedInitIndex
  });

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv(defaultEnvironment);
    config = require('../src/config').default;
  });

  describe('functions.executeIndexOperation', () => {
    let functionsConfig;

    beforeEach(async () => {
      jest.clearAllMocks();
      functionsTest = functionsTestInit();
      functionsConfig = config;
    });

    test('functions runs with an update', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(testDocument, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        ...testDocument,
        title: 'The Prison'
      }, 'document/1');

      const documentChange = functionsTest.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await mockExport(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(mockConsoleInfo).toBeCalledTimes(3);
      expect(mockConsoleInfo).toBeCalledWith(
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
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });

    test('functions runs with an update with a boolean data type set as true', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(testDocument, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        ...testDocument,
        popular: true
      }, 'document/1');

      const documentChange = functionsTest.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await mockExport(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(mockConsoleInfo).toBeCalledTimes(2);
      expect(mockConsoleInfo).toBeCalledWith(
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
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });
  });
});
