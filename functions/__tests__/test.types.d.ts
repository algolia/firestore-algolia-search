import { ModuleMocker } from "jest-mock";

declare global {
  namespace NodeJS {
    interface Global {
      config: () => ModuleMocker;
      snapshot: (
        input?: { input?: any; changed?: number; notTheInput?: string },
        path?: string
      ) => any;
      defaultEnvironment: any;
      mockDocumentSnapshotFactory: (
        documentSnapshot: any
      ) => jest.MockedFunction<any>;
      mockSearchModule: () => jest.MockedFunction<any>;
      mockIndexer: jest.MockedFunction<any>;
      mockedAddAlgoliaAgent: jest.MockedFunction<any>;
      mockedInitIndex: jest.MockedFunction<any>;
      mockLogger: jest.MockedFunction<any>;
      mockFirestoreUpdate: jest.MockedFunction<any>;
      mockFirestoreTransaction: jest.MockedFunction<any>;
      clearMocks: () => void;
    }
  }
}
