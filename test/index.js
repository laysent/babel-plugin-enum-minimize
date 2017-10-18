const fs = require('fs');
const { transform } = require('babel-core');
const plugin = require('../');

const content = [
  'export const first = "first";',
  '// comment in middle',
  'export const second = "second";',
  '/* another comment */',
  'export const last = "last";',
  '',
].join('\n');

describe('babel-plugin-enum-minimize', () => {
  it('should replace enums when // @enums is at top', () => {
    const file = `// @enums\n${content}`;
    const actual = transform(file, {
      plugins: [[plugin, { useString: true, asciiOnly: false }]],
    }).code;
    expect(actual).toBe([
      '// @enums',
      'export const first = "!";',
      '// comment in middle',
      'export const second = "\\\"";',
      '/* another comment */',
      'export const last = "#";',
    ].join('\n'));
  });
  it('should not replace enums when top comment is not // @enums', () => {
    const file = `// @enums else\n${content}`;
    const actual = transform(file, { plugins: [plugin] }).code;
    expect(actual).toBe(file.trim());
  });
  it('should not replace enums when there is no top comment', () => {
    const file = content;
    const actual = transform(file, { plugins: [plugin] }).code;
    expect(actual).toBe(file.trim());
  });
  it('should replace multiple enums with unicode', () => {
    const exports = Array.from({ length: 62 })
      .map((_, i) => `export const a_${i} = "${i}";`).join('\n');
    const file = `// @enums\n${exports}`;
    const actual = transform(file, { plugins: [[plugin, { useString: true, asciiOnly: false }]] }).code;
    const expectedExports = Array.from({ length: 61 })
      .map((_, i) => {
        let char = String.fromCharCode(i + 33);
        if (char === '"') char = '\\"';
        if (char === '\\') char = '\\\\';
        return `export const a_${i} = "${char}";`
      })
      .join('\n');
    const expected = `// @enums\n${expectedExports}\nexport const a_61 = "\\u0100";`;

    expect(actual).toBe(expected);
  });
  it('should replace multiple enums with ascii only string', () => {
    const exports = Array.from({ length: 37 })
    .map((_, i) => `export const a_${i} = "${i}";`).join('\n');
    const file = `// @enums\n${exports}`;
    const actual = transform(file, {
      plugins: [[plugin, { useString: true, asciiOnly: true }]],
    }).code;
    const expectedExports = Array.from({ length: 36 })
    .map((_, i) => {
      let char;
      if (i < 10) char = i.toString();
      else char = String.fromCharCode(i + 33);
      return `export const a_${i} = "${char}";`
    })
    .join('\n');
    const expected = `// @enums\n${expectedExports}\nexport const a_37 = "10";`;
  });
  it('should replace multiple enums with number', () => {
    const file = `// @enums\n${content}`;
    const actual = transform(file, {
      plugins: [[plugin, { useString: false }]],
    }).code;
    expect(actual).toBe([
      '// @enums',
      'export const first = 0;',
      '// comment in middle',
      'export const second = 1;',
      '/* another comment */',
      'export const last = 2;',
    ].join('\n'));
  });
  it('should use unicode as default option', () => {
    const exports = Array.from({ length: 62 })
    .map((_, i) => `export const a_${i} = "${i}";`).join('\n');
    const file = `// @enums\n${exports}`;
    const actual = transform(file, { plugins: [plugin] }).code;
    const expectedExports = Array.from({ length: 61 })
      .map((_, i) => {
        let char = String.fromCharCode(i + 33);
        if (char === '"') char = '\\"';
        if (char === '\\') char = '\\\\';
        return `export const a_${i} = "${char}";`
      })
      .join('\n');
    const expected = `// @enums\n${expectedExports}\nexport const a_61 = "\\u0100";`;

    expect(actual).toBe(expected);
  });
});
