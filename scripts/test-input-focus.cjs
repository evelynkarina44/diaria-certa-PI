const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(file) {
  const exports = {};
  const react = { createElement: (type, props, ...children) => ({ type, props, children }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports, require: name => { assert.equal(name, 'react'); return react; } });
  return exports;
}
test('web remove outline de todos os campos, mantendo foco por teclado sem afetar botões', () => {
  const tree = load('src/components/input-focus-style/index.web.tsx').InputFocusStyle();
  assert.equal(tree.type, 'style');
  const css = tree.children.join('');
  for (const selector of ['input', 'textarea', 'select']) {
    assert.ok(css.includes(selector + ':focus'));
    assert.ok(css.includes(selector + ':focus-visible'));
  }
  assert.match(css, /outline: none !important/);
  assert.match(css, /box-shadow: inset/);
  assert.equal(css.includes('border:'), false, 'bordas de erro e normais não devem ser sobrescritas');
  assert.equal(css.includes('button'), false);
});
test('aplicação inclui a regra global; versão nativa não usa DOM nem altera os campos', () => {
  assert.equal(load('src/components/input-focus-style/index.tsx').InputFocusStyle(), null);
  const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
  assert.equal((app.match(/<InputFocusStyle\s*\/>/g) ?? []).length, 1);
});
