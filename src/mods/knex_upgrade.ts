import { API, FileInfo, FunctionExpression, JSCodeshift } from 'jscodeshift';
const addImports = require('jscodeshift-add-imports');

const convertToAsyncKnex = (j:JSCodeshift, originalFn: FunctionExpression, functionName: string) => {
    const newFunction = j.template.statement`export async function ${functionName}(knex: Knex): Promise<void> {}`;
    newFunction.declaration.body = originalFn.body;
    return newFunction;
};

/**
 * Replace a HOC with a call to a corresponding hook
 */
module.exports = function transformer(
    file: FileInfo,
    api: API,
    // options: Options
) {
    const j = api.jscodeshift;
    const root = j(file.source);
    addImports(root, [j.template.statement`import {Knex} from "knex"`]);
    const exportRoot = root
        .find(j.MemberExpression, { type: 'MemberExpression', object: { type: 'Identifier', name: 'exports' } })
        .forEach(path => {
            if(j.Identifier.check(path.value.property))
            {
                if((/seed|up|down/).test(path.value.property.name)) {
                    if(j.FunctionExpression.check(path.parent.value.right)){
                        j(path.parent).replaceWith(convertToAsyncKnex(j,path.parent.value.right, path.value.property.name));
                    }
                }
            }

        });
    return exportRoot.toSource();
};
