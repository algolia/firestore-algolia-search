import algoliasearch from 'algoliasearch';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import { mocked } from 'ts-jest/utils';
import { version } from '../src/version';

jest.mock('algoliasearch');

const defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: 'title,awards,meta'
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
      version
    );
    expect(mockedInitIndex).toHaveBeenCalled();
    expect(mockedInitIndex).toHaveBeenCalledWith(
      defaultEnvironment.ALGOLIA_INDEX_NAME
    );
  });
});
