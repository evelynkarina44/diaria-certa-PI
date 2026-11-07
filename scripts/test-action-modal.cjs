const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function harness() {
  const slots = []; let cursor = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useRef: initial => { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
    useState: initial => { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
    useEffect: () => {},
  };
  const native = Object.fromEntries(['ActivityIndicator','Modal','Pressable','ScrollView','Text','View'].map(name => [name, name]));
  native.StyleSheet = { create: value => value, absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } };
  const output = {};
  const source = fs.readFileSync(path.join(root, 'src/components/action-modal/index.tsx'), 'utf8');
  const imports = { react, 'react-native': native, '@expo/vector-icons': { Ionicons: 'Icon' } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText, { exports: output, require: name => imports[name] });
  return props => { cursor = 0; return output.ActionModal(props); };
}
function nodes(node) { if (!node || typeof node !== 'object') return []; return [node, ...(node.props.children ?? []).flat(Infinity).flatMap(nodes)]; }
function button(tree, label) {
  return nodes(tree).find(node => node.type === 'Pressable' && nodes(node).some(child => child.type === 'Text' && child.props.children.includes(label)));
}

test('opening a confirmation modal performs no action; cancel only dismisses', () => {
  let confirmed = 0, closed = 0;
  const render = harness();
  const tree = render({ visible: true, title: 'Confirm?', message: 'Example', variant: 'confirm', confirmLabel: 'Confirm', cancelLabel: 'Cancel', onConfirm: () => { confirmed++; }, onClose: () => { closed++; } });
  assert.equal(confirmed, 0);
  button(tree, 'Cancel').props.onPress();
  assert.equal(closed, 1);
  assert.equal(confirmed, 0);
});

test('only confirmation executes the action; repeated click while pending is ignored', async () => {
  let calls = 0, release;
  const action = new Promise(resolve => { release = resolve; });
  const render = harness();
  const props = { visible: true, title: 'Confirm?', message: 'Example', confirmLabel: 'Confirm', cancelLabel: 'Cancel', onConfirm: () => { calls++; return action; }, onClose: () => {} };
  let tree = render(props);
  const confirm = button(tree, 'Confirm');
  confirm.props.onPress(); confirm.props.onPress();
  assert.equal(calls, 1);
  tree = render(props);
  assert.equal(nodes(tree).filter(node => node.type === 'Pressable').every(node => node.props.disabled), true);
  release(); await action; await Promise.resolve();
});

test('busy modal cannot confirm, close on backdrop, or close with Android back button', () => {
  let calls = 0, closed = 0;
  const render = harness();
  const tree = render({ visible: true, busy: true, title: 'Wait', message: 'Processing', onConfirm: () => { calls++; }, onClose: () => { closed++; } });
  tree.props.onRequestClose();
  nodes(tree).find(node => node.type === 'Pressable' && node.props.accessibilityLabel === 'Fechar aviso').props.onPress();
  nodes(tree).filter(node => node.type === 'Pressable').at(-1).props.onPress();
  assert.equal(calls, 0); assert.equal(closed, 0);
});

test('error modal acknowledges without invoking a business action', async () => {
  let closed = 0;
  const tree = harness()({ visible: true, variant: 'error', title: 'Error', message: 'Check the fields', onClose: () => { closed++; } });
  button(tree, 'Entendi').props.onPress();
  await Promise.resolve();
  assert.equal(closed, 1);
});

test('all five action screens use the shared modal and do not call the web-incompatible Alert.alert', () => {
  for (const screen of ['PagamentoScreen','CheckInDiaristaScreen','AvaliacaoScreen','SolicitacoesDiaristaScreen','AgendarDiariaScreen']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
    assert.ok(source.includes('<ActionModal'), screen);
    assert.equal(source.includes('Alert.alert'), false, screen);
  }
});
