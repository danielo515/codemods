import { JSCodeshift } from 'jscodeshift';
import { createObjectPattern } from '../utils';

/**
 * Removes one argument/property from an object
 * pattern on a function definition.
 * May work on other scenarios, but didn't tried
 * This should have been as simple as this:
        j(path)
            .find(j.Property, {
                key: {
                    name: argumentName,
                },
            })
            .remove()
 * but recast has a bug that introduces weird formatting, so we need to recreate it from scratch
 */
export const removeObjectArgument = (argumentName, j) => (path) => {
    // I like to find the property that I want, then scale up to the parent.
    // That way I don't need to find all object patterns and then filter by property
    const objPattern = j(path)
        .find(j.Property, {
            key: {
                name: argumentName,
            },
        })
        .paths()[0].parent;
    const acceptedProps = objPattern.value.properties
        .map((path) => path.value.name)
        .filter((prop) => prop !== argumentName);
    const typeAnnotation = objPattern.value.typeAnnotation;
    const newObj = createObjectPattern(
        acceptedProps,
        typeAnnotation?.typeAnnotation.id.name
    );
    j(objPattern).replaceWith(newObj);
}; // This simpler version has a render bug

export const removeFromObj = (argumentName: string, j: JSCodeshift) => (path) =>
    j(path)
        .find(j.Property, {
            key: {
                name: argumentName,
            },
        })
        .remove();
