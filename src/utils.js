const { parse } = require('recast');
/** @typedef {import('jscodeshift').ImportDeclaration} ImportDeclaration */
/** @typedef {import('jscodeshift').JSCodeshift} JSCodeshift */

const getFirstNode = (root) => root.find(j.Program).get('body', 0).node;
exports.getFirstNode = getFirstNode;

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

exports.removePreservingComments = removePreservingComments;
/**
 * Given a list of identifier names
 * extracts the import paths that contains them
 * It is recommended to build a fresh AST to pass to this function
 * if you are removing or manipulating imports in any way
 * @param {String[]} identifiers
 * @param {import('jscodeshift').Collection} root
 * @param {JSCodeshift} j
 */
function getImportsOfIdentifiers(identifiers, root, j) {
    return root
        .find(j.ImportDeclaration)
        .filter((declaration) =>
            declaration.node.specifiers.some((specifier) =>
                identifiers.includes(specifier.local.name)
            )
        )
        .paths();
}

exports.getImportsOfIdentifiers = getImportsOfIdentifiers;

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
            (importDeclaration) =>
                importDeclaration.node.specifiers.length === 0
        )
        .forEach(removePreservingComments);
}

exports.removeFromImport = removeFromImport;

/**
 *
 *
 * @param {String[]} namesToKeep
 * @param {JSCodeshift} j
 */
const trimImports = (namesToKeep, j) =>
    function (importPath) {
        return importPath
            .find(j.ImportSpecifier)
            .filter((path) => !namesToKeep.includes(path.node.imported.name))
            .remove();
    };

exports.trimImports = trimImports;

/**
 * Creates a shorthand version of an objectProperty
 * @param {string} propName
 * @returns {import('jscodeshift').ObjectProperty}
 */
const shortProperty = (j, propName) => {
    return {
        ...j.property('init', j.identifier(propName), j.identifier(propName)),
        shorthand: true,
    };
};

module.exports.shortProperty = shortProperty;

/**
 *https://github.com/benjamn/recast/issues/240
 * creates an object pattern from a list of property names.
 * Can be used to generate destructured declarations or function
 * arguments destructured
 * I use this method because recast has a bug producing object patterns programmatically,
 * it introduces unnecessary line returns.
 * @param {string[]} propNames
 * @returns {import('jscodeshift').ObjectPattern}
 */
function createObjectPattern(propNames) {
    const js = `function foo({ ${propNames.join(', ')} }) {};`;
    return parse(js).program.body[0].params[0];
}

module.exports.createObjectPattern = createObjectPattern;
