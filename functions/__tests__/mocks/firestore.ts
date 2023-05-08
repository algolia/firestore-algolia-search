import * as functionsTestInit from 'firebase-functions-test';
import document from '../data/document';
import { logger } from 'firebase-functions';

export const documentPath = 'document/1';

let functionsTest = functionsTestInit();
export const snapshot = (
  input = { input: document },
  path = documentPath
) => {
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

export const mockLogger = () => {
  const { logger } = require('firebase-functions');
  jest.spyOn(logger, 'info');
  return {
    info: jest.spyOn(logger, 'info').mockImplementation(),
    error: jest.spyOn(logger, 'error').mockImplementation(),
  };
};
