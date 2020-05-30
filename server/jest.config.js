module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json'
    }
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
  },
  moduleNameMapper: {
    'graphql-tag': '<rootDir>/node_modules/graphql-tag'
  },
  testMatch: [
    '**/src/**/*.(test|spec).(ts|js)'
  ],
  testPathIgnorePatterns: ['dist'],
  testEnvironment: 'node'
};
