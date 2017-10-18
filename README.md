# babel-plugin-enum-minimize

Babel plugin that will minimize the enum defininition in specified file.

Use comment at top to determine whether enable the feature for current file.

## Examples

Suppose you have a file defined all `Redux` action types as follows:

**In**

```javascript
// @enums
export const add = 'todos/add';
export const remove = 'todos/remove';
export const complete = 'todos/complete';
export const filter = 'todo-list/filter';
```

**Out**

```javascript
// @enums
export const add = '!';
export const remove '"';
export const complete = '#';
export const filter = '$';
```

Please notice that this is an opt-in feature, meaning that you have to write `// @enums` at top of
file to enable this feature file by file.

## Installation

```sh
$ npm install babel-plugin-enum-minimize
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["enum-minimize"]
}
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['enum-minimize'],
});
```

## Options

### `useString`

`boolean`, defaults to `true`.

This option determines whether you would like to keep string as `enum` types. If `false` is given,
integers starting from 0 will be used instead. Meanwhile, if use string, char starting from `"!"`
will be used.

### `asciiOnly`

`boolean`, defaults to `false`.

This option determines whether you allow to have unicode char in string. It will only be valid when
you set `useString` option to `true`.

When `asciiOnly` is set to be true, enum will be transformed to a string representation of it's
index in radix 16. However, if use unicode, characters from range `"!"` to `"]"` and any character
whose charCode is greater than 256 will be used.

## License

MIT