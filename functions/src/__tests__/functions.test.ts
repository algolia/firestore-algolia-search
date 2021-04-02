const { logger } = require("firebase-functions");

const consoleInfoSpy = jest.spyOn(logger, "info").mockImplementation();

import functionsConfig from "../config";
import { obfuscatedConfig } from "../logs";
import * as exportedFunctions from "../";

describe("extension", () => {
  // beforeEach(() => {});

  test("functions configuration detected from environment variables", async () => {
    expect(functionsConfig).toMatchSnapshot();
  });

  test("functions configuration is logged on initialize", async () => {
    expect(consoleInfoSpy).toBeCalledWith(
      "Initializing extension with configuration",
      obfuscatedConfig
    );
  });

  test("functions are exported", async () => {
    expect(exportedFunctions.executeIndexOperation).toBeInstanceOf(Function);
  });
});
