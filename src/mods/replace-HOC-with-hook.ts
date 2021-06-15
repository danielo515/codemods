import { findFunctionNamed } from '../utils/findFunctionNamed';
import { buildImport } from '../utils/buildImport';
import { API, FileInfo, JSCodeshift, Options } from 'jscodeshift';
import {
    createObjectPattern,
    isUsed,
    removeFromImport,
    removeObjectArgument as removeObjectProp,
} from '../utils';
import { failIfMissing } from '../utils/failIfMissing';
import { StatementKind } from 'ast-types/gen/kinds';
const addImports = require('jscodeshift-add-imports');

const prependToFunctionBody =
    (j: JSCodeshift, node: StatementKind) => (path) => {
        const prepend = (fn) => {
            if (!j.BlockStatement.check(fn.node.body)) {
                fn.node.body = j.blockStatement([
                    node,
                    j.returnStatement(fn.node.body),
                ]);
                return;
            }
            return fn.get('body').get('body').unshift(node);
        };
        // if node is already a function, prepend to it
        if (j.Function.check(path.value)) {
            prepend(path);
        }
        // if it is not, find the closest function
        j(path).find(j.Function).forEach(prepend);
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

    const { hocName, hookName, importFrom, injectedProp } = options;

    failIfMissing(hocName, 'a HOC name as --hocName', api);
    failIfMissing(hookName, 'a hook name as --hookName', api);
    failIfMissing(
        importFrom,
        'the path to import the hook from as --importFrom',
        api
    );
    failIfMissing(
        injectedProp,
        'the prop the HOC injects as --injectedProp',
        api
    );

    const buildHookCall = (hookArgs) =>
        j.variableDeclaration('const', [
            j.variableDeclarator(
                createObjectPattern([injectedProp]),
                j.callExpression(j.identifier(hookName), hookArgs)
            ),
        ]);

    const HOCExecutions = root.find(j.CallExpression, {
        callee: { name: hocName },
    });
    // if there are no HOC executions, just bail out
    if (HOCExecutions.length === 0) return;
    // If no substitution was performed, then no add the hook as import
    let shouldAddHookImport = false;

    HOCExecutions.forEach((path) => {
        const hookArgs = path.node.arguments;
        const wrappedComponent = path.parent.value.arguments[0];
        const maybeComponent = findFunctionNamed(
            root,
            j,
            wrappedComponent.name
        ).forEach(removeObjectProp(injectedProp, j));

        if (maybeComponent.length === 0) return;

        const hookCall = buildHookCall(hookArgs);
        shouldAddHookImport = true;

        maybeComponent.forEach(prependToFunctionBody(j, hookCall));
        // because this is curried, the parent is the call expression
        j(path.parent).replaceWith(wrappedComponent);
    });
    if (shouldAddHookImport)
        addImports(root, buildImport(j, hookName, importFrom));
    // because our substitution, the HOC may not be used anymore
    if (!isUsed(j, root, hocName)) {
        removeFromImport(root.find(j.ImportDeclaration), hocName, j);
    }
    return root.toSource();
};
