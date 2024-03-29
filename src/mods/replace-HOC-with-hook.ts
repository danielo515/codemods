import { prependToFunctionBody } from './../utils/prependToFunctionBody';
import { findFunctionNamed } from '../utils/findFunctionNamed';
import { buildImport } from '../utils/buildImport';
import { API, FileInfo, Identifier, Options } from 'jscodeshift';
import { createObjectPattern, isUsed, removeFromImport } from '../utils';
import { failIfMissing } from '../utils/failIfMissing';
import { removeFromObj } from '../utils/removeObjectArgument';
import { removeFromTypedArgs } from '../utils/removeFromTypedArgs';
import addImports from 'jscodeshift-add-imports';

export default function transformer(
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
            j.CallExpression.check(wrappedComponent) // Is the component wrapped in a call?
                ? (wrappedComponent.arguments[0] as Identifier).name
                : wrappedComponent.name
        ).forEach(removeFromObj(j, injectedProp));

        if (maybeComponent.length === 0) return;

        const hookCall = buildHookCall(hookArgs);
        shouldAddHookImport = true;

        // Remove potential current usages from props
        maybeComponent
            .find(j.ObjectProperty, {
                key: { name: injectedProp },
            })
            .remove();

        maybeComponent
            .forEach(prependToFunctionBody(j, hookCall))
            .forEach(removeFromTypedArgs(j, root, injectedProp));
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
}
