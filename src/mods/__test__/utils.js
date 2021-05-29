// const jest = require('jest');
const { runTest } = require('jscodeshift/dist/testUtils');
const fs = require('fs');
const path = require('path');
/**
 * Handles some boilerplate around defining a simple jest/Jasmine test for a
 * jscodeshift transform that also writes to an output file.
 */
function defineTestGenerating(
    dirName,
    transformName,
    options,
    testFilePrefix,
    testOptions
) {
    const testName = testFilePrefix
        ? `transforms correctly using "${testFilePrefix}" data`
        : 'transforms correctly';
    describe(transformName, () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });
        const fixtureDir = path.join(dirName, '..', '__testfixtures__');
        const generatedPath = path.join(
            fixtureDir,
            testFilePrefix + `.generated.${'js'}`
        );
        const expectedGeneratedOutput = fs
            .readFileSync(generatedPath, 'utf8')
            .trim();
        jest.spyOn(fs, 'writeFileSync').mockImplementation((path, data) => {});
        it(testName, () => {
            runTest(
                dirName,
                transformName,
                options,
                testFilePrefix,
                testOptions
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.any(String),
                expectedGeneratedOutput
            );
        });
    });
}
exports.defineTestGenerating = defineTestGenerating;
