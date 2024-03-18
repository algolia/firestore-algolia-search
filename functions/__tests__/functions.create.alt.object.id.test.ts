import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import testDocument, { documentID, recordID, testReleaseDate } from './data/document';
import { mockedPartialUpdateObject } from './mocks/search';

let restoreEnv;
let functionsTest = functionsTestInit();

describe('extension', () => {
  globalThis.mockSearchModule();
  const defaultEnvironment = globalThis.defaultEnvironment;

  let config;
  beforeEach(() => {
    restoreEnv = mockedEnv({ ...defaultEnvironment, ALT_OBJECT_ID: 'id' });
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

    test('functions runs with a create with Alt Object ID', async () => {
      const beforeSnapshot = globalThis.snapshot({}, documentID);
      const afterSnapshot = globalThis.snapshot(testDocument, documentID);

      const documentChange = globalThis.makeChange(
        beforeSnapshot,
        afterSnapshot
      );

      const data = {};
      const callResult = await globalThis.mockIndexerResult(documentChange, data);

      expect(callResult).toBeUndefined();

      const payload = {
        'objectID': recordID,
        'path': afterSnapshot.ref.path,
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate': testReleaseDate.getTime()
        },
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      };

      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });
  });

  test('functions runs with a create with Alt Object ID using document path', async () => {
    config.altObjectId = '(path)';

    const beforeSnapshot = globalThis.snapshot({}, documentID);
    const afterSnapshot = globalThis.snapshot(testDocument, documentID);

    const documentChange = globalThis.makeChange(
      beforeSnapshot,
      afterSnapshot
    );

    const data = {};
    const callResult = await globalThis.mockIndexerResult(documentChange, data);

    expect(callResult).toBeUndefined();

    const payload = {
      'objectID': documentID,
      'path': afterSnapshot.ref.path,
      'title': afterSnapshot.data().title,
      'awards': [
        'awards/1'
      ],
      'meta': {
        'releaseDate': testReleaseDate.getTime()
      },
      'lastmodified': {
        '_operation': 'IncrementSet',
        'value': expect.any(Number)
      }
    };

    expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
  });
});
