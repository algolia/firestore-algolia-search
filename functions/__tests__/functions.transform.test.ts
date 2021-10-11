import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import fetch, { Response } from 'node-fetch';
import { mocked } from 'ts-jest/utils';
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
  FIELDS: 'title,awards,meta',
  TRANSFORM_FUNCTION: 'helloWorld'
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

    test('functions runs with a create with transform function', async () => {
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
        ...responseData,
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      }

      mocked(fetch).mockImplementation(() =>
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

      expect(mockedPartialUpdateObject).toBeCalledWith(payload,  { createIfNotExists: true });
    });
  });
});
