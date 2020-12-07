#!/usr/bin/env node

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

const [modName] = args;

const modsDir = join(__dirname, '../mods');
const listOfMods = readdirSync(modsDir);
const modNames = listOfMods.map((name) => name.replace('.js', ''));
console.log(modNames);

if (!listOfMods.includes(modName)) {
    console.log(
        `Unknown mod, please use one of the following: 
    ${modNames.join('\n')}`
    );
    exit(1);
}
