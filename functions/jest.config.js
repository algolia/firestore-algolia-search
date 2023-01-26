const packageJson = require("./package.json");

module.exports = {
  displayName: packageJson.name,
  rootDir: './',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/__tests__/tsconfig.json',
      },
    ],
  },
  preset: "ts-jest",
  setupFiles: ["<rootDir>/__tests__/jest.setup.ts"],
  testMatch: ["**/__tests__/*.test.ts"],
};
