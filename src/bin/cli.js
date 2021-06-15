#!/usr/bin/env node

const { spawnSync } = require('child_process');
const { readdirSync } = require('fs');
const { basename, join } = require('path');
const { exit } = require('process');

const usage = `
Usage:

${basename(process.argv[1])} codemod-name [options] path/to/files
`;
const args = process.argv.slice(2);

if (args.length < 1) {
    console.log(usage);
    exit(1);
}

const [modName, ...restArgs] = args;

const modsDir = join(__dirname, '../mods');
const listOfMods = readdirSync(modsDir).filter(
    (filename) => !filename.startsWith('__')
);
// index by Name => fileName
const availableMods = new Map(
    listOfMods.map((name) => [name.replace(/\.(j|t)s$/, ''), name])
);

if (!availableMods.has(modName)) {
    console.log(
        `Unknown mod, please use one of the following:\n - ${Array.from(
            availableMods,
            ([name]) => name
        ).join('\n - ')}`
    );
    exit(1);
}
let output;
try {
    output = spawnSync(
        join(__dirname, '../../node_modules/jscodeshift/bin/jscodeshift.js'),
        [
            '-t',
            require.resolve(`../mods/${availableMods.get(modName)}`),
            ...restArgs,
        ]
    );
} catch (e) {
    console.log(e, output);
}
if (output) {
    console.log(output.stderr.toString());
    console.log(output.stdout.toString());
}
