/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'node',
    verbose: true,
    modulePaths: ['<rootDir>/src'],
    testRegex: '/__tests__/.*(test)\\.(j|t)s',
    testURL: 'http://localhost',
};
