const failIfMissing = (value, missing_info, api) => {
    if (!value) {
        api.report(`You must provide ${missing_info}`);
        process.exit(1);
    }
};
/**
 * This code-mod allows you to add a property to those component calls that do not include it.
 * Useful for deprecating/removing default values
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

    const { propName, propValue } = options;
    failIfMissing(propName, 'a property name', api);
    failIfMissing(propValue, 'a value for the property', api);

    return root
        .find(j.JSXElement, {
            openingElement: { name: { name: options.name } },
        })
        .forEach((path) => {
            const attributes = path.get('attributes');
            const hasProp = attributes.value.some(
                ({ name }) => name && name.name === propName
            );
            if (!hasProp)
                attributes.value.push(
                    j.jsxAttribute(
                        j.jsxIdentifier(propName),
                        j.stringLiteral(propValue)
                    )
                );
        })
        .toSource();
};
