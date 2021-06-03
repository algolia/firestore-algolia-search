import algoliasearch from 'algoliasearch';
import { firestore } from 'firebase-admin/lib/firestore';
import * as functionsTestInit from 'firebase-functions-test';
import mockedEnv from 'mocked-env';
import { mocked } from 'ts-jest/utils';
import { mockConsoleInfo } from './__mocks__/console';
import {version} from '../src/version';
import Timestamp = firestore.Timestamp;

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

const releaseDate = new Date(1995, 12, 1);
const document = {
    "title": "The Shawshank Redemption",
    "alternative_titles": [
      "En verden udenfor",
      "Cadena Perpetua",
      "A remény rabjai",
      "Um Sonho de Liberdade",
      "The Shawshank Redemption - Stephen King"
    ],
    "year": 1994,
    "meta": {
      "releaseDate": Timestamp.fromDate(releaseDate),
    },
    "awards": [
      new firestore.Firestore().doc("/awards/1"),
    ],
    "image": "https://image.tmdb.org/t/p/w154/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg",
    "color": "#8C634B",
    "score": 9.97764206054169,
    "rating": 5,
    "actors": [
      "Tim Robbins",
      "Morgan Freeman",
      "Bob Gunton",
      "William Sadler",
      "Clancy Brown",
      "Gil Bellows",
      "Mark Rolston",
      "James Whitmore",
      "Jeffrey DeMunn",
      "Larry Brandenburg",
      "David Proval",
      "Jude Ciccolella"
    ],
    "actor_facets": [
      "https://image.tmdb.org/t/p/w45/tuZCyZVVbHcpvtCgriSp5RRPwMX.jpg|Tim Robbins",
      "https://image.tmdb.org/t/p/w45/oGJQhOpT8S1M56tvSsbEBePV5O1.jpg|Morgan Freeman",
      "https://image.tmdb.org/t/p/w45/b3NfI0IzPYI40eIEtO9O0XQiR8j.jpg|Bob Gunton",
      "https://image.tmdb.org/t/p/w45/deRJUFbO8uqPSQT3B6Vgp4jiJir.jpg|William Sadler",
      "https://image.tmdb.org/t/p/w45/pwiG1ljLoqfcmFH2zFp5NP2ML4B.jpg|Clancy Brown",
      "https://image.tmdb.org/t/p/w45/f5An5NqejnTEflFmW7Vp18zVOvJ.jpg|Gil Bellows",
      "https://image.tmdb.org/t/p/w45/bsh3cqDNwVvux4NdaY1Bj4S7mNS.jpg|Mark Rolston",
      "https://image.tmdb.org/t/p/w45/r1xOgXFjqhn2fonn78rlXKPZGFw.jpg|James Whitmore",
      "https://image.tmdb.org/t/p/w45/wMRlF3VRApPduQBAuNEVM4ncYcN.jpg|Jeffrey DeMunn",
      "https://image.tmdb.org/t/p/w45/3TGsmGFwJps4dmVncOZIO3p6ToO.jpg|Larry Brandenburg",
      "https://image.tmdb.org/t/p/w45/ujBzP61tYlwqWpB3oOxknl1XuEg.jpg|David Proval",
      "https://image.tmdb.org/t/p/w45/6nuAG4DVlCc0h2rfrbpJhdmKudx.jpg|Jude Ciccolella"
    ],
    "genre": [
      "Drama",
      "Crime"
    ],
    "objectID": "439817390"
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

  describe('functions.executeIndexOperation', () => {
    let functionsConfig;

    beforeEach(async () => {
      jest.clearAllMocks();
      functionsTest = functionsTestInit();
      functionsConfig = config;
    });

    test('functions runs with a deletion', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(document, 'document/1');
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
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(document, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot({
        ...document,
        title: 'The Prison'
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
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate':releaseDate
        },
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Updating existing Algolia index for document ${ afterSnapshot.id }`,
        payload
      );
      expect(mockedPartialUpdateObject).toBeCalledWith(payload, { createIfNotExists: true });
    });

    test('functions runs with a create', async () => {
      const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot({}, 'document/1');
      const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot(document, 'document/1');

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
        'title': afterSnapshot.data().title,
        'awards': [
          'awards/1'
        ],
        'meta': {
          'releaseDate':releaseDate
        },
        'lastmodified': {
          '_operation': 'IncrementSet',
          'value': expect.any(Number)
        }
      }
      expect(mockConsoleInfo).toBeCalledWith(
        `Creating new Algolia index for document ${ afterSnapshot.id }`,
        payload
      );

      expect(mockedPartialUpdateObject).toBeCalledWith(payload,  { createIfNotExists: true });
    });
  });
});
