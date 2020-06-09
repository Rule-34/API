module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',

  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
}
