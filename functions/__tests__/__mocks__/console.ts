import { logger } from "firebase-functions";

export const mockConsoleInfo = jest.spyOn(logger, "info").mockImplementation();

export const mockConsoleError = jest
  .spyOn(logger, "error")
  .mockImplementation();
