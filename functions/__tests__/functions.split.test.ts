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

  const mockedPartialUpdateObjects = jest.fn();
  const mockedSaveObjects = jest.fn();
  const mockedDeleteObject = jest.fn();
  const mockedInitIndex = jest.fn((): {
    deleteObject: jest.Mock<any, any>;
    saveObjects: jest.Mock<any, any>;
    partialUpdateObjects: jest.Mock<any, any>
  } => ({
    saveObjects: mockedSaveObjects,
    deleteObject: mockedDeleteObject,
    partialUpdateObjects: mockedPartialUpdateObjects
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

    test('functions runs with a create with split function', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot(testDocument, 'document/1');
      const originalData = {
        'objectID': afterSnapshot.id,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'actors': afterSnapshot.data().actors,
        'actor_facets': afterSnapshot.data().actor_facets,
        'actorSplitting': afterSnapshot.data().actorSplitting,
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        }
      }

      const { actors, actor_facets, actorSplitting, ...rest } = originalData

      const ids: string[] = actors.map(actor => afterSnapshot.id + '-' + actor)

      const splittedData: any[] = actors.map((actor, index) => ({
        ...rest,
        objectID: ids[index],
        actor,
        facet: actor_facets[index]
      }))

      const transformedData = splittedData.map(data => ({
        ...data,
        "hello": "world"
      }))

      const payload = transformedData.map(data => ({
        ...data,
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      }))

      jest.mocked(fetch).mockImplementation((url) => {
        const urlSegments: string[] = url.split('/')
        const functionName = urlSegments[urlSegments.length - 1]

        switch (functionName) {
          case process.env.TRANSFORM_FUNCTION : {
            return Promise.resolve({
              json: () => Promise.resolve({ result: transformedData }),
            } as Response)
          }
          case process.env.SPLIT_FUNCTION : {
            return Promise.resolve({
              json: () => Promise.resolve({ result: splittedData }),
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
      //   `Creating new Algolia index for document ${ afterSnapshot.id }`,
      //   payload
      // );

      expect(mockedPartialUpdateObjects).toBeCalledWith(payload,  { createIfNotExists: true });
    });
  });
});
