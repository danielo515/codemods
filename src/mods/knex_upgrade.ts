import { API, FileInfo } from 'jscodeshift';
const addImports = require('jscodeshift-add-imports');

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
                if(path.value.property.name === 'seed') {
                    if(j.FunctionExpression.check(path.parent.value.right)){
                        const funBody = (path.parent.value.right.body);
                        const newFunction = j.template.statement`export async function seed(knex: Knex): Promise<void> {}`;
                        newFunction.declaration.body = funBody;
                        j(path.parent).replaceWith(newFunction);
                    }
                }
            }

        });
    return exportRoot.toSource();
};
