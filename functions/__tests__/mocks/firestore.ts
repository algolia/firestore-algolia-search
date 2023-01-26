import * as functionsTestInit from 'firebase-functions-test';
import document from '../data/document';

export const documentPath = 'document/1';

export const snapshot = (
  input = { input: document },
  path = documentPath
) => {
  let functionsTest = functionsTestInit();
  return functionsTest.firestore.makeDocumentSnapshot(input, path);
};

export const mockDocumentSnapshotFactory = (documentSnapshot) => {
  return jest.fn().mockImplementation(() => {
    return {
      exists: true,
      get: documentSnapshot.get.bind(documentSnapshot),
      ref: { path: documentSnapshot.ref.path },
    };
  })();
};

export const makeChange = (before, after) => {
  let functionsTest = functionsTestInit();
  return functionsTest.makeChange(before, after);
};

export const mockFirestoreTransaction = jest.fn().mockImplementation(() => {
  return (transactionHandler) => {
    transactionHandler({
      update(ref, field, data) {
        mockFirestoreUpdate(field, data);
      },
    });
  };
});

export const mockFirestoreUpdate = jest.fn();

export const mockLogger = (): {
  infoMock: jest.Mock,
  errorMock: jest.Mock;
} => {
  const mocks: {
    infoMock: jest.Mock,
    errorMock: jest.Mock;
  } = {
    infoMock: jest.fn(),
    errorMock: jest.fn()
  };
  require("firebase-functions").logger = {
    infoMock: mocks.infoMock,
    errorMock: mocks.errorMock,
  };

  return mocks;
}
