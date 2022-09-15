import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import fetch, { Response } from 'node-fetch';
import { mockConsoleInfo } from './__mocks__/console';
import testDocument from './data/document';

jest.mock('algoliasearch');
jest.mock('node-fetch');

const defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: 'title,awards,meta,actors,actor_facets,actorSplitting',
  TRANSFORM_FUNCTION: 'helloWorld',
  SPLIT_KEY: 'actorSplitting',
  SPLIT_FUNCTION: 'helloSplit',
  IDS_GEN_FUNCTION: 'helloIds'
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
  const mockedSaveObjects = jest.fn();
  const mockedDeleteObjects = jest.fn();
  const mockedInitIndex = jest.fn((): {
    deleteObjects: jest.Mock<any, any>;
    saveObjects: jest.Mock<any, any>;
    partialUpdateObject: jest.Mock<any, any>
  } => ({
    saveObjects: mockedSaveObjects,
    deleteObjects: mockedDeleteObjects,
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

    test('functions runs with a deletion', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(testDocument, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');

      const ids: string[] = beforeSnapshot.data().actors.map(actor => beforeSnapshot.id + '-' + actor)

      jest.mocked(fetch).mockImplementation((url) => {
        const urlSegments: string[] = url.split('/')
        const functionName = urlSegments[urlSegments.length - 1]

        switch (functionName) {
          case process.env.IDS_GEN_FUNCTION : {
            return Promise.resolve({
              json: () => Promise.resolve({ result: ids }),
            } as Response)
          }
          default: {
            return Promise.resolve({
              json: () => Promise.resolve({ result: null }),
            } as Response)
          }

        }
      });


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
      // expect(mockConsoleInfo).toBeCalledWith(
      //   `Deleting existing Algolia index for document ${ afterSnapshot.id }`
      // );
      expect(mockedDeleteObjects).toBeCalledWith(ids);
    });
  });
});
