const { defineInlineTest } = require('jscodeshift/dist/testUtils');
const transformer = require('./add-react-property');

describe('transformer', () => {
    defineInlineTest(
        { default: transformer, parser: 'flow' },
        {},
        `
    import Button from '@fancylib/button';
  
    export default () => (
      <Button isInLoadingStatus>Click me</Button>
    );
    `,
        `
    import Button from '@fancylib/button';
  
    export default () => (
      <Button loading>Click me</Button>
    );
    `,
        'change isInLoadingStatus to loading'
    );
});
