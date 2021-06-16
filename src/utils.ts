import {
    Collection,
    ImportDeclaration,
    JSCodeshift,
    ObjectPattern,
} from 'jscodeshift';

const { parse } = require('recast');
/** @typedef {import('jscodeshift').ImportDeclaration} ImportDeclaration */
/** @typedef {import('jscodeshift').JSCodeshift} JSCodeshift */

export const getFirstNode = (j, root) =>
    root.find(j.Program).get('body', 0).node;

/**
 *
 *
 * @param {import('jscodeshift').ASTPath<*>} path
 */
export function removePreservingComments(path) {
    const comments = path.node.comments;
    if (comments && comments.length) path.parent.node.comments = comments;
    path.prune();
}

/**
 * Given a list of identifier names
 * extracts the import paths that contains them
 * It is recommended to build a fresh AST to pass to this function
 * if you are removing or manipulating imports in any way
 * @param {String[]} identifiers
 * @param {import('jscodeshift').Collection} root
 * @param {JSCodeshift} j
 */
export function getImportsOfIdentifiers(identifiers, root, j) {
    return root
        .find(j.ImportDeclaration)
        .filter((declaration) =>
            declaration.node.specifiers.some((specifier) =>
                identifiers.includes(specifier.local.name)
            )
        )
        .paths();
}

/**
 * Removes elements from an import
 * if the final import is empty, also removes it
 */
export function removeFromImport(
    importPath: Collection<ImportDeclaration>,
    nameToRemove: string,
    j: JSCodeshift
) {
    const filter = { local: { name: nameToRemove } };
    importPath.find(j.ImportSpecifier, filter).remove();

    importPath.find(j.ImportDefaultSpecifier, filter).remove();
    // describe(importPath);
    return importPath
        .filter(
            (importDeclaration) =>
                importDeclaration.node.specifiers.length === 0
        )
        .forEach(removePreservingComments);
}

/**
 * Removes all the import specifiers from an import
 * except for the ones on the list provided
 */
export const trimImports = (namesToKeep: string[], j: JSCodeshift) =>
    function (importPath) {
        return importPath
            .find(j.ImportSpecifier)
            .filter((path) => !namesToKeep.includes(path.node.imported.name))
            .remove();
    };

/**
 * Creates a shorthand version of an objectProperty
 * @param {string} propName
 * @returns {import('jscodeshift').ObjectProperty}
 */
export const shortProperty = (j, propName) => {
    return {
        ...j.property('init', j.identifier(propName), j.identifier(propName)),
        shorthand: true,
    };
};

/**
 *https://github.com/benjamn/recast/issues/240
 * creates an object pattern from a list of property names.
 * Can be used to generate destructured declarations or function
 * arguments destructured
 * I use this method because recast has a bug producing object patterns programmatically,
 * it introduces unnecessary line returns.
 */
export function createObjectPattern(
    propNames: string[],
    annotation?: string
): ObjectPattern {
    const js = `function foo({ ${propNames.join(', ')} }${
        annotation ? ': ' + annotation : ''
    } ) {};`;
    return parse(js, { parser: require('recast/parsers/flow') }).program.body[0]
        .params[0];
}

/**
 * Tells you if an imported identifier is used, excluding it's own import statement
 * Borrowed from:
 * https://github.com/jeremistadler/codemod-remove-unused-imports/blob/master/index.js
 */
export const isUsed = (j: JSCodeshift, root: Collection, local: string) => {
    return (
        root
            .find(j.Identifier, {
                name: local,
            })
            .filter((p) => {
                return (
                    p.parent.value.type !== 'ImportSpecifier' &&
                    p.parent.value.type !== 'ImportDefaultSpecifier'
                );
            })
            .size() > 0
    );
};
