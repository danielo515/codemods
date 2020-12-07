module.exports = function (file, api, options) {
    const j = api.jscodeshift;
    const { functionName, maxParams } = options;
    if (!functionName && !maxParams) {
        api.report('You must provide a function name or a max-params options');
        return file.source;
    }
    const root = j(file.source);
    return root
        .find(j.ArrowFunctionExpression)
        .filter((path) => path.parent.value.id?.name === functionName)
        .forEach((path) => {
            const paramNames = path.node.params.map((x) =>
                j.identifier(x.name)
            );
            const params = paramNames.map((x) => {
                const a = j.objectProperty(x, x);
                a.shorthand = true;
                return a;
            });
            path.node.params = [j.objectPattern(params)];
            //Now replace all calls
            root.find(j.CallExpression)
                .filter((x) => x.node.callee.name === 'mapPayBlock')
                .forEach(({ node }) => {
                    const args = node.arguments;
                    console.log(args);
                    node.arguments = [
                        j.objectExpression(
                            args.map((arg, i) =>
                                j.objectProperty(paramNames[i], arg)
                            )
                        ),
                    ];
                });
        })
        .toSource();
};

module.exports.parser = 'flow'; // use the flow parser
