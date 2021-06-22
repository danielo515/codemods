import { ASTPath, JSCodeshift, Function, Collection } from 'jscodeshift';

/**
 * Given a function path that contains a named typed argument (not inlined type definition)
 * looks for that type definition, and if it contains the provided type name it removes it
 * @param j jscodeshift api
 * @param root the root path that is used to generate the new file
 * @param typeName the name of the type to remove from the typed argument
 * @example
 * // input
 * type Args = { a: boolean, b: boolean }
 * function (args: Args)
 * // execution
 * removeFromTypedArgs(j,root, 'a')
 * //output
 * type Args = { b: boolean }
 * function (args: Args)
 */
export const removeFromTypedArgs =
    (j: JSCodeshift, root: Collection<any>, typeName: string) =>
    (path: ASTPath<Function>) => {
        if (!path.node.params.length) return;
        const removeProp = (name) => (path) => {
            j(path).find(j.ObjectTypeProperty, { key: { name } }).remove();
        };
        j(path)
            .find(j.GenericTypeAnnotation)
            .find(j.Identifier)
            .forEach((annotation) => {
                const name = annotation.value.name;
                root.find(j.TypeAlias, { id: { name } }).forEach(
                    removeProp(typeName)
                );
            });
    };
