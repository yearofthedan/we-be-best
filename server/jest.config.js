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
  preset: 'ts-jest',
};
