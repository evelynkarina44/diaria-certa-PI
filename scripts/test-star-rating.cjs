const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const output = {};
const imports = {
  react: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
  'react-native': { Pressable: 'Pressable', View: 'View' },
  '@expo/vector-icons': { Ionicons: 'Icon' },
};
const source = fs.readFileSync(path.join(root, 'src/components/star-rating/index.tsx'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
} }).outputText, { exports: output, require: name => imports[name] });
const { StarRating } = output;
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props.children ?? []).flat(Infinity).flatMap(nodes)];
}
function icons(tree) { return nodes(tree).filter(node => node.type === 'Icon').map(node => node.props.name); }
function buttons(tree) { return nodes(tree).filter(node => node.type === 'Pressable'); }

test('choose 3 stars: first three filled, last two empty', () => {
  let value = 0;
  const render = () => StarRating({ value, onChange: next => { value = next; } });
  buttons(render())[2].props.onPress();
  assert.equal(value, 3);
  assert.deepEqual(icons(render()), ['star', 'star', 'star', 'star-outline', 'star-outline']);
});

test('each choice 1-5 and decreasing choices update all five stars cumulatively', () => {
  let value = 0;
  const render = () => StarRating({ value, onChange: next => { value = next; } });
  for (const selected of [1, 2, 3, 4, 5, 3, 1]) {
    buttons(render())[selected - 1].props.onPress();
    assert.equal(value, selected);
    assert.deepEqual(icons(render()), Array.from({ length: 5 }, (_, index) => index < selected ? 'star' : 'star-outline'));
  }
});

test('saved/sending evaluation does not change from accidental clicks', () => {
  let called = false;
  const tree = StarRating({ value: 3, disabled: true, onChange: () => { called = true; } });
  buttons(tree).forEach(button => { assert.equal(button.props.disabled, true); button.props.onPress(); });
  assert.equal(called, false);
  assert.deepEqual(icons(tree), ['star', 'star', 'star', 'star-outline', 'star-outline']);
});
