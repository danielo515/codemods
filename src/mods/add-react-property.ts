import { API, FileInfo, Options } from 'jscodeshift';
import { failIfMissing } from '../utils/failIfMissing';
/**
 * This code-mod allows you to add a property to those component calls that do not include it.
 * Useful for deprecating/removing default values
 */
module.exports = function transformer(
    file: FileInfo,
    api: API,
    options: Options
) {
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
