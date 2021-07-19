import {
    ASTPath,
    Collection,
    Function,
    JSCodeshift,
    VariableDeclarator,
} from 'jscodeshift';

const pathIsFunction = (path: ASTPath<VariableDeclarator>) =>
    ['FunctionExpression', 'ArrowFunctionExpression'].includes(
        path.node.init.type
    );

export const findFunctionNamed = (
    root: Collection<any>,
    j: JSCodeshift,
    name: string
): Collection<Function> => {
    const asFunctionDeclaration = root.find(j.FunctionDeclaration, {
        id: {
            name,
        },
    });
    if (asFunctionDeclaration.length > 0) return asFunctionDeclaration;
    return root
        .find(j.VariableDeclarator, {
            id: {
                name,
            },
        })
        .filter(pathIsFunction)
        .find(j.Function)
        .at(0);
};
