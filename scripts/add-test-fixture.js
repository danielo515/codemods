const fs = require('fs-extra');
const path = require('path');

function main(args) {
    const [caseName] = args;
    if (!caseName) throw new Error('You must provide a test-case name!!!');
    const requiredFiles = [
        `${caseName}.input.js`,
        `${caseName}.output.js`,
        `${caseName}.generated.js`,
    ].map((fileName) =>
        path.join(process.cwd(), './src/mods/__testfixtures__', fileName)
    );
    requiredFiles.forEach(fs.ensureFileSync);
    console.log('generated:', requiredFiles);
}

main(process.argv.slice(2));
