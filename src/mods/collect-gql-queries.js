const fs = require('fs-extra');
const path = require('path');
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

    const root = j(fileInfo.source);

    if (!options.name) {
        report('Target file name not provided, using default of graphql.js');
    }

    const targetFilename = options.name || 'graphql.js';

    if (fileInfo.path.endsWith(targetFilename)) {
        report('Omit ' + fileInfo.path);
        return;
    }

    const allQueriesOnDocument = root.find(j.TaggedTemplateExpression, {
        tag: { name: 'gql' }
    });
    // The queries as imports once you remove them from the document
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
        queriesToExport.push(j(parent.parent).toSource());
        dependencies.push(
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
        j.stringLiteral(`./${targetFilename}`),
        'value'
    );

    const destinationFile = path.join(
        path.dirname(fileInfo.path),
        targetFilename
    );

    // If no queries found, skip code generation
    if (queriesToExport.length === 0) return;

    // Write te exported queries to the target destination
    fs.writeFileSync(
        destinationFile,
        [...dependencies, ...queriesToExport].join('\n')
    );

    return root
        .find(j.ImportDeclaration)
        .at(0)
        .insertAfter(importQueriesStatement)
        .toSource();
};
