import { Collection, ImportDeclaration, JSCodeshift } from 'jscodeshift';

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
 * @param {string[]} propNames
 * @returns {import('jscodeshift').ObjectPattern}
 */
export function createObjectPattern(propNames) {
    const js = `function foo({ ${propNames.join(', ')} }) {};`;
    return parse(js).program.body[0].params[0];
}

/**
 * Removes one argument/property from an object
 * pattern on a function definition.
 * May work on other scenarios, but didn't tried
 * This should have been as simple as this:
        j(path)
            .find(j.Property, {
                key: {
                    name: argumentName,
                },
            })
            .remove()
 * but recast has a bug that introduces weird formatting, so we need to recreate it from scratch
 */
export const removeObjectArgument = (argumentName, j) => (path) => {
    // I like to find the property that I want, then scale up to the parent.
    // That way I don't need to find all object patterns and then filter by property
    const objPattern = j(path)
        .find(j.Property, {
            key: {
                name: argumentName,
            },
        })
        .paths()[0].parent;
    const acceptedProps = objPattern.value.properties
        .map((path) => path.value.name)
        .filter((prop) => prop !== argumentName);
    j(objPattern).replaceWith(createObjectPattern(acceptedProps));
};
