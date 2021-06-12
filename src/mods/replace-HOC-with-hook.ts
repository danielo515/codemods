import {
    API,
    ASTPath,
    Collection,
    FileInfo,
    JSCodeshift,
    Options,
    VariableDeclarator,
} from 'jscodeshift';
import {
    createObjectPattern,
    removeObjectArgument as removeObjectProp,
} from '../utils';

const pathIsFunction = (path: ASTPath<VariableDeclarator>) =>
    ['FunctionExpression', 'ArrowFunctionExpression'].includes(
        path.node.init.type
    );

const prependToBodyBlock = (j, node) => (path) =>
    j(path)
        .find(j.BlockStatement)
        .at(0)
        .forEach((block) => (block.node.body = [node, ...block.node.body]));

const findFunctionNamed = (
    root: Collection<any>,
    j: JSCodeshift,
    name: string
) => {
    const asFunctionDeclaration = root.find(j.FunctionDeclaration, {
        id: { name },
    });
    if (asFunctionDeclaration.length > 0) return asFunctionDeclaration;
    return root
        .find(j.VariableDeclarator, {
            id: { name },
        })
        .filter(pathIsFunction);
};
/**
 * Replace a HOC with a call to a corresponding hook
 */
module.exports = function transformer(
    file: FileInfo,
    api: API,
    options: Options
) {
    const j = api.jscodeshift;

    const root = j(file.source);

    const { hocName, hookName } = options;

    if (!hocName) {
        api.report('You must provide a HOC name!');
        process.exit(1);
    }

    if (!hookName) {
        api.report('You must provide a hook name!');
        process.exit(1);
    }

    const injectedProp = '__';

    const buildHookCall = (hookArgs) =>
        j.variableDeclaration('const', [
            j.variableDeclarator(
                //j.objectPattern([shortProperty(j, injectedProp)]),
                createObjectPattern([injectedProp]),
                j.callExpression(j.identifier(hookName), hookArgs)
            ),
        ]);

    return root
        .find(j.CallExpression, {
            callee: { name: 'polyglotProvider' },
        })
        .forEach((path) => {
            const hookArgs = path.node.arguments;
            const wrappedComponent = path.parent.value.arguments[0];
            const maybeComponent = findFunctionNamed(
                root,
                j,
                wrappedComponent.name
            ).forEach(removeObjectProp(injectedProp, j));

            const hookCall = buildHookCall(hookArgs);

            maybeComponent.forEach(prependToBodyBlock(j, hookCall));
            // because this is curried, the parent is the call expression
            j(path.parent).replaceWith(wrappedComponent);
        })
        .toSource();
};
