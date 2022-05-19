# Danielo codemods
This is a collection of [ codemods ](https://github.com/facebook/codemod) designed to blend any javascript codebase to my tyrannical desires.
Codemods here will re-factor pieces of javascript code to adhere to certain programming practices that I think are better than others.
Please check the documentation for each codemod to understand what it is supposed to do.

## Executing codemods
You don't need to install this library to force your code to follow my fantastic impositions, all you need is to have npm installed and run the following command

```bash
npx danielo-mod mod-name --firstArgument=value --parser=flow your/source/code/path
```

If you don't use flow, just remove `--parser=flow`


### Local execution

If you want to execute a codemod locally (you have this repo cloned and just want to run from here) you can do it providing all the required parameters to jscodeshift:

```bash
yarn jscodeshift -t src/mods/transform-file.ts /full/path/to/target-files
```

There is a convenience script if you want to run a typescript transformation (provides correct parser and extensions list):

```bash
yarn execute-ts -t src/mods/transform-file.ts /full/path/to/target-files
```

## CODEMODS

### named-function-params

Replace all functions (with a name) definitions and calls to take named arguments instead of positional ones.
Turns:

```js
const add = (a,b) => a + b
add(1,2)
```
into:

```js
// --maxArgs=1 or --functionName=add
const add = ({ a, b }) => a + b
add({a: 1, b: 2 })
```

#### Arguments
It accepts either :
- `--functionName=name` where name is the function name you want to refactor
- `--maxArgs=2` where 2 can be any number that you want to use as threshold to decide if a function needs to be refactored or not

### react-to-object

Turns an array of react components into an array of Objects. This only works for literal lists of react components:

```js
[
    <MyStuff value="hello" onClick={() => console.log('clicked')}>
]
```
into:

```js
[{
    value: "hello",
    onClick: () => console.log('clicked')
}]
```
#### Arguments
It accepts:
- `--name=component_name` where component name is the  component you want to translate to objects

### add-react-property

Adds a new react property if it does not exist previously. Useful if you want to deprecate default values, so you can add the default value to all existing invocdations.

#### Arguments
- `--name=component_name` the name of the component you want to add properties to
- `--propName=name` the name of the property you want to add
- `--propValue=value` the value of the property you want to add
