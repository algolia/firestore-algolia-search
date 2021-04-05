"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { logger } = require("firebase-functions");
const consoleInfoSpy = jest.spyOn(logger, "info").mockImplementation();
const config_1 = require("../config");
const logs_1 = require("../logs");
const exportedFunctions = require("../");
describe("extension", () => {
    // beforeEach(() => {});
    test("functions configuration detected from environment variables", async () => {
        expect(config_1.default).toMatchSnapshot();
    });
    test("functions configuration is logged on initialize", async () => {
        expect(consoleInfoSpy).toBeCalledWith("Initializing extension with configuration", logs_1.obfuscatedConfig);
    });
    test("functions are exported", async () => {
        expect(exportedFunctions.executeIndexOperation).toBeInstanceOf(Function);
    });
});
