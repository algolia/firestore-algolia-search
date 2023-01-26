import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import { version } from '../src/version';

let restoreEnv;

describe('extension', () => {
  const mockedAlgoliaSearch = globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;
  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv(defaultEnvironment);
    config = require('../src/config').default;
  });

  test('functions are exported', () => {
    const exportedFunctions = jest.requireActual('../src');
    expect(exportedFunctions.executeIndexOperation).toBeInstanceOf(Function);
  });

  describe('extension.executeIndexOperation', () => {
    test('algolia search client, user agent, and index are initialized', () => {
      expect(mockedAlgoliaSearch).toHaveBeenCalled();
      expect(mockedAlgoliaSearch).toHaveBeenCalled();
      expect(mockedAlgoliaSearch).toHaveBeenCalledWith(
        defaultEnvironment.ALGOLIA_APP_ID,
        defaultEnvironment.ALGOLIA_API_KEY,
      );
      expect(globalThis.mockedAddAlgoliaAgent).toHaveBeenCalled();
      expect(globalThis.mockedAddAlgoliaAgent).toHaveBeenCalledWith(
        'firestore_integration',
        version
      );
      expect(globalThis.mockedInitIndex).toHaveBeenCalled();
      expect(globalThis.mockedInitIndex).toHaveBeenCalledWith(
        defaultEnvironment.ALGOLIA_INDEX_NAME
      );
    });
  });
});
