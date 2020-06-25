module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  moduleNameMapper: {
    'graphql-tag': '<rootDir>/node_modules/graphql-tag',
  },
  testMatch: [
    '**/src/**/*.(test|spec).(ts|js)',
  ],
  testPathIgnorePatterns: [
    'dist',
  ],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/src/testHelpers'],
  preset: 'ts-jest',
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
  },
};
