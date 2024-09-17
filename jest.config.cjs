const { createDefaultEsmPreset } = require('ts-jest');

const defaultEsmPreset = createDefaultEsmPreset();

/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'node',
    testRegex: '/__tests__/.*(test)\\.[jt]s',
    modulePaths: ['<rootDir>/src'],
    ...defaultEsmPreset,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
