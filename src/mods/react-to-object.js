/**
 *  Have you ever wanted to turn a list of react components into a list of objects?
 * This code-mod allows you to turn any call to certain react component into an object
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').Options} options
 */
module.exports = function transformer(file, api, options) {
    const j = api.jscodeshift;

    const root = j(file.source);

    if (!options.name) {
        api.report('You must provide a component name!');
        process.exit(1);
    }

    return root
        .find(j.JSXElement, {
            openingElement: { name: { name: options.name } },
        })
        .filter((path) => path.parent.get('type').value === 'ArrayExpression') //Only nodes inside lists
        .replaceWith((path) => {
            const attributes = path.get('attributes');
            return j.objectPattern(
                attributes.value.map(({ name, value }) =>
                    j.objectProperty(
                        j.identifier(name.name),
                        value
                            ? value.expression || value
                            : j.booleanLiteral(true)
                    )
                )
            );
        })
        .toSource();
};
