const fs = require('fs-extra');
const path = require('path');
const { describe } = require('jscodeshift-helper');

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

/**
 *
 *
 * @param {import('jscodeshift').ASTPath<*>} path
 */
function removePreservingComments(path) {
    const comments = path.node.comments;
    if (comments && comments.length) path.parent.node.comments = comments;
    path.prune();
}

/**
 * Removes elements from an import
 * if the final import is empty, also removes it
 * @param {import('jscodeshift').Collection<ImportDeclaration>} importPath
 * @param {string} nameToRemove
 * @param {JSCodeshift} j
 */
function removeFromImport(importPath, nameToRemove, j) {
    importPath
        .find(j.ImportSpecifier, { imported: { name: nameToRemove } })
        .remove();
    // describe(importPath);
    return importPath
        .filter(
            importDeclaration => importDeclaration.node.specifiers.length === 0
        )
        .forEach(removePreservingComments);
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
    // The queries as imports once you remove them from the document
    const importNames = [];
    // The body of the queries we want to move to a new file
    const queriesToExport = [];
    // Any dependency the queries may have, like an imported fragment
    const dependencies = [gqlDependency.toSource(), ''];
    // I don't like this, but this seems to be the only way to "collect stuff"
    allQueriesOnDocument.forEach(query => {
        const parent = query.parent;
        const varName = parent.node.id.name;
        importNames.push(j.importSpecifier(j.identifier(varName)));
        // parent.parent because parent is just a declarator, and we want the whole declaration!
        queriesToExport.push(exportStatement(parent.parent.node, j).toSource());
        // Look for dependencies inside the string template, like fragments
        dependencies.concat(
            j(query)
                .find(j.TemplateLiteral)
                .find(j.Identifier)
                .paths()
                .map(identifier => {
                    return root
                        .find(j.ImportSpecifier, {
                            imported: { name: identifier.node.name }
                        })
                        .toSource();
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
    // Write te exported queries to the target destination
    fs.writeFileSync(
        destinationFile,
        [...dependencies, ...queriesToExport].join('\n')
    );

    root.find(j.ImportDeclaration)
        .at(0)
        .insertBefore(importQueriesStatement);

    //===== Cleanup =====
    return removeFromImport(root.find(j.ImportDeclaration), 'gql', j).toSource({
        quote: 'single'
    });
};

// return root
//     .find(j.ImportDeclaration)
//     .map(Import => {
//         Import.value.specifiers = Import.value.specifiers.filter(
//             sp => sp.imported.name !== 'gql'
//         );
//         if (Import.node.specifiers.length === 0) Import.replace(null);
//         return Import;
//     })
