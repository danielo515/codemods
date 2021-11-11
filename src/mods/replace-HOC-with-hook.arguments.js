module.exports =
    //transform the below object into a list of inquirer questions
    [
        {
            type: 'input',
            name: 'hocName',
            message: 'What is the name of the HOC you want to be replaced',
            default: 'MyComponent',
        },
        {
            type: 'input',
            name: 'hookName',
            message:
                'What is the name of the hook you want to use to replace the HOC?',
            default: 'useMyComponent',
        },
        {
            type: 'input',
            name: 'importFrom',
            message: 'The import path of the HOOK',
            default: (answers) => `hooks/${answers.hookName}`,
        },
        {
            type: 'input',
            name: 'injectedProp',
            message:
                'What is the name of the prop the HOC was injecting into the component?',
            default: '__',
        },
    ];
