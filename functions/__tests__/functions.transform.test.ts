import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import fetch, { Response } from 'node-fetch';
import testDocument, { documentID, testReleaseDate } from './data/document';
import { mockedPartialUpdateObject } from './mocks/search';

jest.mock('node-fetch');

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv({ ...defaultEnvironment, TRANSFORM_FUNCTION: 'helloWorld' });
    config = require('../src/config').default;
  });

  describe('functions.executeIndexOperation', () => {
    const logger = globalThis.mockLogger();
    const infoMock = logger.info;
    let functionsConfig;

    beforeEach(async () => {
      jest.clearAllMocks();
      functionsTest = functionsTestInit();
      functionsConfig = config;
    });

    test('functions runs with a create with transform function', async () => {
      const beforeSnapshot = globalThis.snapshot({}, documentID);
      const afterSnapshot = globalThis.snapshot(testDocument, documentID);
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
        'hello': 'world'
      };
      const payload = {
        ...responseData,
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      };

      jest.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ result: responseData }),
        } as Response)
      );

      const documentChange = globalThis.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();
      expect(infoMock).toBeCalledTimes(3);
      expect(infoMock).toBeCalledWith(
        'Started extension execution with configuration',
        functionsConfig
      );
      expect(infoMock).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );

      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });
  });
});
