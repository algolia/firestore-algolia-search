import {
  snapshot,
  mockDocumentSnapshotFactory,
  mockFirestoreUpdate,
  mockFirestoreTransaction,
  mockLogger
} from "./mocks/firestore";
import {
  mockIndexer,
  mockedInitIndex,
  mockedAddAlgoliaAgent,
  mockSearchModule,
} from "./mocks/search";

globalThis.config = () => require("../src/config").default;

globalThis.snapshot = snapshot;

globalThis.mockDocumentSnapshotFactory = mockDocumentSnapshotFactory;

globalThis.mockIndexer = mockIndexer;

globalThis.mockedAddAlgoliaAgent = mockedAddAlgoliaAgent;

globalThis.mockedInitIndex = mockedInitIndex;

globalThis.mockSearchModule = mockSearchModule;

globalThis.mockFirestoreUpdate = mockFirestoreUpdate;

globalThis.mockFirestoreTransaction = mockFirestoreTransaction;

globalThis.mockLogger = mockLogger;

globalThis.defaultEnvironment = {
  PROJECT_ID: 'fake-project',
  LOCATION: 'us-central1',
  ALGOLIA_APP_ID: 'algolia-app-id',
  ALGOLIA_API_KEY: '********',
  ALGOLIA_INDEX_NAME: 'algolia-index-name',
  COLLECTION_PATH: 'movies',
  FIELDS: 'title,awards,meta'
};

globalThis.clearMocks = () => {
  mockFirestoreUpdate.mockClear();
  // mockSearchModule.mockClear();
};
