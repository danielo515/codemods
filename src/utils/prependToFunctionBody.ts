import { StatementKind } from 'ast-types/gen/kinds';
import { ASTPath, JSCodeshift, Function } from 'jscodeshift';

export const prependToFunctionBody =
    (j: JSCodeshift, node: StatementKind) => (path: ASTPath<Function>) => {
        if (!j.Function.check(path.value)) {
            throw new Error(
                'You passed a path (or collection of paths) that is not a function'
            );
        }

        if (!j.BlockStatement.check(path.node.body)) {
            path.node.body = j.blockStatement([
                node,
                j.returnStatement(path.node.body),
            ]);
            return;
        }

        return path.get('body').get('body').unshift(node);
    };
