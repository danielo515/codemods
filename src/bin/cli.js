#!/usr/bin/env node

const { spawnSync } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const { basename, join } = require('path');
const { exit } = require('process');
const inquirer = require('inquirer');
const { readFile } = require('fs/promises');
const ignore = require('ignore');

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));
const usage = `
Usage:

${basename(process.argv[1])} codemod-name [options] path/to/files
`;
const args = process.argv.slice(2);

function getAvailableCodemods() {
    const modsDir = join(__dirname, '../mods');
    const listOfMods = readdirSync(modsDir).filter(
        (filename) => !/^(__|\.)|(?:\w+\.){2}js$/.test(filename)
    );
    // index by Name => fileName
    const availableMods = new Map(
        listOfMods.map((name) => [name.replace(/\.(j|t)s$/, ''), name])
    );
    return availableMods;
}

function executeCodemod(modName, modArgs) {
    let output;
    try {
        const spanwArgs = [
            '-t',
            require.resolve(`../mods/${availableMods.get(modName)}`),
            ...modArgs,
        ];
        const jscodeshiftBinary = join(
            require.resolve('jscodeshift'),
            '../bin/jscodeshift.js'
        );

        console.log(`Running jscodeshift ${spanwArgs.join(' ')}`);
        output = spawnSync(jscodeshiftBinary, spanwArgs);
    } catch (e) {
        console.log(e, output);
    }
    if (output) {
        console.log(output.stderr.toString());
        console.log(output.stdout.toString());
    }
}

async function getCodemodArguments(codemod) {
    const argumentsFile = join(__dirname, '../mods', codemod + '.arguments.js');
    const modArguments = existsSync(argumentsFile)
        ? require(argumentsFile)
        : [];
    const gitIgnoreFile = await readFile(
        join(process.cwd(), '.gitignore'),
        'utf8'
    ).catch(() => '');
    const ig = ignore().add(gitIgnoreFile);

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'parser',
            description: 'Select a parser',
            choices: ['typescript', 'flow'],
            filter: (parser) => (parser === 'typescript' ? 'tsx' : 'js'),
        },
        {
            type: 'fuzzypath',
            name: 'path',
            excludePath: (path) =>
                path === './'
                    ? false
                    : path.startsWith('.') || ig.ignores(path),
            excludeFilter: (path) => (path === './' ? false : ig.ignores(path)),
            itemType: 'any',
            rootPath: './',
            message: 'Select a target directory for your component:',
            default: 'src',
            suggestOnly: false,
            depthLimit: 5,
        },
        ...modArguments,
    ]);

    const { path: targetPath, ...otherAnswers } = answers;
    return Object.entries(otherAnswers)
        .map(([option, value]) => `--${option}=${value}`)
        .concat([
            answers.parser === 'tsx'
                ? '--extensions=ts,tsx,js,jsx'
                : '---extensions=js,jsx',
            targetPath,
        ]);
}

const availableMods = getAvailableCodemods();

async function main() {
    if (args.length < 1) {
        const { codemod } = await inquirer.prompt([
            {
                type: 'list',
                name: 'codemod',
                description: 'Select a codemod',
                // This does not filter, it transforms the answer, so stupid
                // filter: (name) => ({ name, file: availableMods.get(name) }),
                choices: [...availableMods.keys()],
            },
        ]);
        const modArguments = await getCodemodArguments(codemod);
        return executeCodemod(codemod, modArguments);
    }

    const [modName, ...restArgs] = args;

    if (!availableMods.has(modName)) {
        console.log(
            `Unknown mod, please use one of the following:\n - ${Array.from(
                availableMods,
                ([name]) => name
            ).join('\n - ')}`
        );
        exit(1);
    }
    executeCodemod(modName, restArgs);
}

main();
