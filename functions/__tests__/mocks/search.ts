import * as functionsTestInit from 'firebase-functions-test';

export const mockedAddAlgoliaAgent = jest.fn();

export const mockedPartialUpdateObject = jest.fn();
export const mockedSaveObjects = jest.fn();
export const mockedDeleteObject = jest.fn();
export const mockedInitIndex = jest.fn((): {
  deleteObject: jest.Mock<any, any>;
  saveObjects: jest.Mock<any, any>;
  partialUpdateObject: jest.Mock<any, any>
} => ({
  saveObjects: mockedSaveObjects,
  deleteObject: mockedDeleteObject,
  partialUpdateObject: mockedPartialUpdateObject
}));

export const mockIndexer = () => {
  let functionsTest = functionsTestInit();
  return functionsTest.wrap(require('../../src').executeIndexOperation);
};

export const mockSearchModule = () => {
  jest.mock('algoliasearch');
  const mockedAlgoliaSearch: jest.MockedFunction<any> = jest.mocked(require('algoliasearch'), true);
  mockedAlgoliaSearch.mockReturnValue({
    addAlgoliaAgent: mockedAddAlgoliaAgent,
    // @ts-ignore
    initIndex: mockedInitIndex
  });
  return mockedAlgoliaSearch;
};

export function mockSearchModuleFactory() {
  return mockSearchModule;
}

export const mockIndexerResult = (document, data) => {
  const indexer = mockIndexer();
  return indexer(document, data);
};
