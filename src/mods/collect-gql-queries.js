const fs = require('fs-extra');
const path = require('path');
const {
    getImportsOfIdentifiers,
    removeFromImport,
    trimImports
} = require('../utils');
const { describe } = require('jscodeshift-helper');

/**
 * Calls the toSource method of a collection.
 * Usefult to map it on an array of collections
 * @param {import('jscodeshift').Collection<*>} node
 * @returns {string}
 */
function toSource(node) {
    return node.toSource();
}

/**
 * Finds the import statements of the gql dependency
 * Removes other imports and returns it as source.
 * Make sure to only call if there is a graphql import, otherwise it may throw
 * @param {string} source
 * @param {import('jscodeshift').JSCodeshift} j
 */
function getGraphqlDependency(source, j, importName = 'gql') {
    const declaration = j(
        j(source)
            .find(j.ImportDeclaration, {
                specifiers: [{ imported: { name: importName } }]
            })
            .get()
    );
    declaration
        .find(j.ImportSpecifier)
        .filter(path => path.node.imported.name !== importName)
        .remove();
    return declaration;
}

/** @typedef {import('jscodeshift').ImportDeclaration} ImportDeclaration */
/** @typedef {import('jscodeshift').JSCodeshift} JSCodeshift */
/**
 *
 * Transform a variable declaration node into a exportStatement path
 * @param {import('jscodeshift').VariableDeclaration} node
 * @param {JSCodeshift} j
 */
function exportStatement(node, j) {
    return j(j.exportNamedDeclaration(node));
}

const defaultOutputName = 'graphql.js';

/**
 * Collect all calls to gql on a file to a sibling file
 * and add imports for them in place
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').Options} options
 */
module.exports = function transformer(fileInfo, api, options) {
    const j = api.jscodeshift;
    const report = api.report || console.info;
    const log = (message, level = 1) => {
        if (options.verbose >= level) report(message);
    };

    const root = j(fileInfo.source);

    if (!options.name) {
        log(
            `Target file name not provided, using default of ${defaultOutputName}`,
            2
        );
    }

    const targetFilename = options.name || defaultOutputName;

    if (fileInfo.path.endsWith(targetFilename)) {
        log('Omit ' + fileInfo.path, 2);
        return; // reported as skipped
    }

    const allQueriesOnDocument = root.find(j.TaggedTemplateExpression, {
        tag: { name: 'gql' }
    });
    const gqlDependency = getGraphqlDependency(fileInfo.source, j);
    // The query names we need to import after removing them from the document
    const importNames = [];
    // The body of the queries we want to move to a new file
    const queriesToExport = [];
    // Any dependency the queries may have, like an imported fragment
    const dependencies = [];
    // I don't like this, but this seems to be the only way to "collect stuff"
    allQueriesOnDocument.forEach(query => {
        const parent = query.parent;
        const varName = parent.node.id.name;
        importNames.push(j.importSpecifier(j.identifier(varName)));
        // parent.parent because parent is just a declarator, and we want the whole declaration!
        queriesToExport.push(exportStatement(parent.parent.node, j).toSource());
        // Look for dependencies inside the string template, like fragments
        dependencies.push(
            ...j(query)
                .find(j.TemplateLiteral)
                .find(j.Identifier)
                .paths()
                .map(identifier => {
                    root.find(j.ImportSpecifier, {
                        imported: { name: identifier.node.name }
                    }).forEach(impSpec =>
                        // cleanup, remove collected deps (identifiers) from the existing imports
                        removeFromImport(
                            j(impSpec.parent),
                            impSpec.node.imported.name,
                            j
                        )
                    );
                    return identifier.node.name;
                })
        );
        // Remove each variable declaration because we will compile them all to a single import
        root.find(j.VariableDeclarator, {
            id: { name: parent.node.id.name }
        }).remove();
    });
    const importQueriesStatement = j.importDeclaration(
        importNames,
        j.stringLiteral(`./${targetFilename.replace(/\.(t|j)s$/, '')}`),
        'value'
    );

    const destinationFile = path.join(
        path.dirname(fileInfo.path),
        targetFilename
    );

    // If no queries found, skip code generation
    if (queriesToExport.length === 0) return root.toSource();

    //===== File Generation=====
    const requiredImports = getImportsOfIdentifiers(
        dependencies,
        j(fileInfo.source),
        j
    );
    // Write te exported queries to the target destination
    fs.writeFileSync(
        destinationFile,
        [
            gqlDependency.toSource(),
            requiredImports
                .map(j)
                .map(trimImports(dependencies, j))
                .map(toSource)
                .join('\n'),
            // if required imports is empty we don't want to introduce double \n
            requiredImports.length ? '' : null,
            ...queriesToExport
        ]
            .filter(x => x !== null)
            .join('\n')
    );

    root.find(j.ImportDeclaration)
        .at(0)
        .insertBefore(importQueriesStatement);

    //===== Cleanup =====
    return removeFromImport(root.find(j.ImportDeclaration), 'gql', j).toSource({
        quote: 'single'
    });
};
