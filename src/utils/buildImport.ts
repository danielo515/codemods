import { JSCodeshift } from 'jscodeshift';

/**
 * Builds a destructured import from the provided identifier name and library (or path) name
 * @param identifier The thing you want to import
 * @param libraryName The library or path you want to import from
 * @example
 * buildImport(j, 'useState', 'react')
 * // import { useState } from 'react'
 */
export const buildImport = (
    j: JSCodeshift,
    identifier: string,
    libraryName: string
) =>
    j.importDeclaration(
        [j.importSpecifier(j.identifier(identifier), j.identifier(identifier))],
        j.stringLiteral(libraryName)
    );
