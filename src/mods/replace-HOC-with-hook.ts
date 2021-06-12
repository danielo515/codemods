import { findFunctionNamed } from '../utils/findFunctionNamed';
import { API, FileInfo, Options } from 'jscodeshift';
import {
    createObjectPattern,
    removeObjectArgument as removeObjectProp,
} from '../utils';

const prependToBodyBlock = (j, node) => (path) =>
    j(path)
        .find(j.BlockStatement)
        .at(0)
        .forEach((block) => (block.node.body = [node, ...block.node.body]));

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

    const HOCExecutions = root.find(j.CallExpression, {
        callee: { name: hocName },
    });
    // if there are no HOC executions, just bail out
    if (HOCExecutions.length === 0) return;

    return HOCExecutions.forEach((path) => {
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
    }).toSource();
};
