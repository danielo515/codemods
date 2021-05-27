module.exports = {
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    testRegex: '^.+\\.(spec|test)\\.(ts|js)$',
    // watchPlugins: [
    //     'jest-watch-typeahead/filename',
    //     'jest-watch-typeahead/testname',
    // ],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    moduleNameMapper: {
        '@mods/(.*)$': '<rootDir>/src/mods/$1',
    },
    testPathIgnorePatterns: ['/node_modules/'],
};
