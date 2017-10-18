const t = require('babel-types');

const asciiStart = 33;
const asciiEnd = 93;
const unicodeStart = 256;

function getNextNumber() {
  let i = 0;
  return function (path) {
    const num = i;
    path.replaceWith(t.numericLiteral(num));
    i += 1;
  };
}

function getNextChar() {
  let num = asciiStart - 1;
  return function (path) {
    num += 1;
    if (num > asciiEnd && num < unicodeStart) num = unicodeStart;
    const str = String.fromCharCode(num);
    path.node.value = str;
  };
}

function getAsciiiNextChar() {
  let i = 0;
  return function (path) {
    const str = i.toString(36);
    i += 1;
    path.node.value = str;
  };
}

module.exports = function () {
  return {
    name: 'babel-plugin-enum-minimize',
    visitor: {
      Program(path, state) {
        const { useString = true, asciiOnly = false } = (state.opts || {});
        const source = path.getSource();
        const shouldWork = /^\/\/ @enums *[\r\n]/.test(source);
        if (!shouldWork) return;
        let next;
        if (useString) {
          if (asciiOnly) {
            next = getAsciiiNextChar();
          } else {
            next = getNextChar();
          }
        } else {
          next = getNextNumber();
        }
        path.traverse({
          ExportNamedDeclaration(innerPath) {
            const variable = innerPath.node.declaration;
            if (!t.isVariableDeclaration(variable)) return;
            if (variable.declarations.length !== 1) return;
            const declarator = variable.declarations[0];
            if (!t.isVariableDeclarator(declarator)) return;
            const string = declarator.init;
            if (!t.isStringLiteral(string)) return;
            innerPath.traverse({ StringLiteral: next });
          },
        });
      },
    },
  };
};
