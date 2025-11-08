/** @type {import('jest').Config} */
const config = {
    roots: ['<rootDir>/src'],
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/src/testUtils/fileMock.ts',
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/testUtils/**'],
};

module.exports = config;

