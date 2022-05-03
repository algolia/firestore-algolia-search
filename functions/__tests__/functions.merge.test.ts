import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import fetch, { Response } from 'node-fetch';
import { mockConsoleInfo } from './__mocks__/console';
import testDocument, { testReleaseDate } from './data/document';

jest.mock('algoliasearch');
jest.mock('node-fetch');

const defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: '',
  ALGOLIA_MERGE_PARENT_CHILD: 'yes',
  ALGOLIA_CHILD_ATTRIBUTE_NAME: 'actors'
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
  const mockedAlgoliasearch = jest.mocked(algoliasearch, true);
  const mockedAddAlgoliaAgent = jest.fn();

  const mockedPartialUpdateObject = jest.fn();
  const mockedSaveObject = jest.fn();
  const mockedGetObject = jest.fn();
  const mockedDeleteObject = jest.fn();
  const mockedInitIndex = jest.fn((): {
    deleteObject: jest.Mock<any, any>;
    saveObject: jest.Mock<any, any>;
    partialUpdateObject: jest.Mock<any, any>;
    getObject: jest.Mock<any, any>;
  } => ({
    saveObject: mockedSaveObject,
    deleteObject: mockedDeleteObject,
    partialUpdateObject: mockedPartialUpdateObject,
    getObject: mockedGetObject,
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

    test.skip('functions runs with a create with transform function', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot(testDocument, 'document/1');
      const responseData = {
        'objectID': afterSnapshot.id,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        },
        "hello": "world"
      }
      const payload = {
        ...responseData
      }

      jest.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ result: responseData }),
        } as Response)
      );

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
      expect(mockConsoleInfo).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );

      expect(mockedSaveObject).toBeCalledWith(payload,  { createIfNotExists: true });
    });
  });
});
