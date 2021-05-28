const { defineTest } = require('jscodeshift/dist/testUtils');

// describe('Collect GraphQl queries', () => {
//     it('Removes then from the original source', () => {
//         runInlineTest(
//             transform,
//             transformOptions,
//             { source: 'input', path: 'some-file.js' },
//             'expected output',
//             'Move gql queries to a separate file'
//         );
//     });
// });

defineTest(__dirname, 'collect-gql-queries', {}, 'graphql-with-fragment');
defineTest(__dirname, 'collect-gql-queries', {}, 'graphql-single-query');
