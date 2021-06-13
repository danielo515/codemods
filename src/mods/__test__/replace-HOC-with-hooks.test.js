const { defineTest } = require('jscodeshift/dist/testUtils');

defineTest(
    __dirname,
    'replace-HOC-with-hook',
    {
        api: { report: console.log },
        hookName: 'usePolyglot',
        hocName: 'polyglotProvider',
        injectedProp: '__',
        importFrom: 'components/polyglotProvider',
    },
    'replace-HOC-with-hook'
);

defineTest(
    __dirname,
    'replace-HOC-with-hook',
    {
        api: { report: console.log },
        hookName: 'usePolyglot',
        hocName: 'polyglotProvider',
        injectedProp: '__',
        importFrom: 'components/polyglotProvider',
    },
    'replace-HOC-with-hook-regular-fn'
);
