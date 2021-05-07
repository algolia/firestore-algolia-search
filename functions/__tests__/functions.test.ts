import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import { mocked } from 'ts-jest/utils';
import { mockConsoleInfo } from './__mocks__/console';

jest.mock('algoliasearch');

const defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: 'title'
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

  const mockedSaveObjects = jest.fn();
  const mockedDeleteObject = jest.fn();
  const mockedInitIndex = jest.fn((): { deleteObject: jest.Mock<any, any>; saveObjects: jest.Mock<any, any> } => ({
    saveObjects: mockedSaveObjects,
    deleteObject: mockedDeleteObject,
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

  test('functions are exported', () => {
    const exportedFunctions = jest.requireActual('../src');
    expect(exportedFunctions.executeIndexOperation).toBeInstanceOf(Function);
  });

  test('algolia search client, user agent, and index are initialized', () => {
    expect(mockedAlgoliasearch).toHaveBeenCalled();
    expect(mockedAlgoliasearch).toHaveBeenCalledWith(
      defaultEnvironment.ALGOLIA_APP_ID,
      defaultEnvironment.ALGOLIA_API_KEY,
    );
    expect(mockedAddAlgoliaAgent).toHaveBeenCalled();
    expect(mockedAddAlgoliaAgent).toHaveBeenCalledWith(
      'firestore_integration',
      '0.1.3'
    );
    expect(mockedInitIndex).toHaveBeenCalled();
    expect(mockedInitIndex).toHaveBeenCalledWith(
      defaultEnvironment.ALGOLIA_INDEX_NAME
    );
  });

  describe('functions.executeIndexOperation', () => {
    let functionsConfig;

    beforeEach(async () => {
      jest.clearAllMocks();
      functionsTest = functionsTestInit();
      functionsConfig = config;
    });

    test('functions runs with a deletion', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        title: 'example title 1'
      }, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');

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
      expect(mockConsoleInfo).toBeCalledWith(
        `Deleting existing Algolia index for document ${ afterSnapshot.id }`
      );
      expect(mockedDeleteObject).toBeCalledWith(afterSnapshot.id);
    });

    test('functions runs with an update', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        title: 'example title 1'
      }, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        title: 'example title 2'
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
        'title': afterSnapshot.data().title
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedSaveObjects).toBeCalledWith([payload]);
    });

    test('functions runs with a create', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        title: 'example title 1'
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
        'title': afterSnapshot.data().title
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );

      expect(mockedSaveObjects).toBeCalledWith([payload]);
    });
  });
});
