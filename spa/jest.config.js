module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  testMatch: ["**/src/**/*.spec.[jt]s?(x)"],
  setupFilesAfterEnv: ["./src/jest-setup.ts"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["<rootDir>/src/testHelpers"]
};
