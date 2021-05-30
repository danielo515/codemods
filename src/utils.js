/** @typedef {import('jscodeshift').ImportDeclaration} ImportDeclaration */
/** @typedef {import('jscodeshift').JSCodeshift} JSCodeshift */

const getFirstNode = (root) => root.find(j.Program).get('body', 0).node;
exports.getFirstNode = getFirstNode;

/**
 *
 *
 * @param {import('jscodeshift').ASTPath<*>} path
 */
exports.removePreservingComments = function removePreservingComments(path) {
    const comments = path.node.comments;
    if (comments && comments.length) path.parent.node.comments = comments;
    path.prune();
};

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
