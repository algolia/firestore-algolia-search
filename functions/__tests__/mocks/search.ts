import * as functionsTestInit from 'firebase-functions-test';

export const mockedAddAlgoliaAgent = jest.fn();

export const mockedPartialUpdateObject = jest.fn();
export const mockedSaveObjects = jest.fn();
export const mockedSaveObject = jest.fn();
export const mockedDeleteObject = jest.fn();
export const mockedInitIndex = jest.fn((): {
  deleteObject: jest.Mock<any, any>;
  saveObject: jest.Mock<any, any>;
  saveObjects: jest.Mock<any, any>;
  partialUpdateObject: jest.Mock<any, any>;
} => ({
  saveObject: mockedSaveObject,
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

export const mockIndexerResult = (document, data) => {
  console.log('mockIndexerResult');
  const indexer = mockIndexer();

  console.log('indexer', indexer);
  // `wrap` calls the raw v2 handler (`.run`), which bypasses the V1 compat shim
  // that production adds, so provide the shimmed `change` and `context` here.
  return indexer({
    data: document,
    change: document,
    context: { timestamp: new Date().toISOString() },
    ...(data as object),
  } as any);
};
