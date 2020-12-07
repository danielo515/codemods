const findArrowName = (path) => path.parent.value.id?.name;
// const tap = (fn) => (arg) => console.log(arg) || fn(arg);

/**
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').Options} options
 */
module.exports = function (file, api, options) {
    const j = api.jscodeshift;
    /**
     * Given a list of argument names, and argument values collapse them
     * to an object call.
     * The list of argValues should be same length or less as the list of argNames.
     * Because the variadic nature of JS we match call-site arguments with expected argNames
     * @param {{argNames: import('jscodeshift').Identifier[], argValues: any[]}} options
     */
    const argumentsToObject = ({ argNames, argValues }) =>
        j.objectExpression(
            argValues.map((value, i) => j.objectProperty(argNames[i], value))
        );

    /**
     * Creates a shorthand version of an objectProperty
     * @param {import('jscodeshift').Identifier} identifier
     * @returns {import('jscodeshift').ObjectProperty}
     */
    const shortProperty = (identifier) => {
        return { ...j.objectProperty(identifier, identifier), shorthand: true };
    };
    const { functionName, maxArgs } = options;
    if (!functionName && !maxArgs) {
        api.report('You must provide either functionName or a maxArgs options');
        return file.source;
    }
    const filter = functionName
        ? (path) => findArrowName(path) === functionName
        : (path) => path.node.params.length > Number(maxArgs);
    const root = j(file.source);
    return root
        .find(j.ArrowFunctionExpression)
        .filter(filter)
        .forEach((path) => {
            const paramNames = path.node.params.map((x) =>
                j.identifier(x.name)
            );
            const name = findArrowName(path);
            path.node.params = [j.objectPattern(paramNames.map(shortProperty))];
            api.report(`changing all call occurrences of ${name}`);
            //Now replace all calls
            root.find(j.CallExpression)
                .filter((x) => x.node.callee.name === name)
                .forEach(({ node }) => {
                    const args = node.arguments;
                    node.arguments = [
                        argumentsToObject({
                            argNames: paramNames,
                            argValues: args,
                        }),
                    ];
                });
        })
        .toSource();
};

module.exports.parser = 'flow'; // use the flow parser
