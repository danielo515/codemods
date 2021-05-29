// const { defineTest } = require('jscodeshift/dist/testUtils');
const { defineTestGenerating } = require('./utils');

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

defineTestGenerating(
    __dirname,
    'collect-gql-queries',
    {},
    'graphql-single-query'
);
defineTestGenerating(
    __dirname,
    'collect-gql-queries',
    {},
    'graphql-with-fragment'
);
