const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function harness(status = 'Aceito', fail = false) {
  const slots = [], effects = [], calls = [];
  let cursor = 0, booking = { id_agendamento: 44, status, data_agendamento: '2099-01-12', horario_inicio: '09:00', checkin_checkout: [] };
  const react = {
    createElement: (type, props, ...children) => typeof type === 'function' ? type(props) : ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ?? (slots[index] = { current: initial }); },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous[i])) { slots[index] = deps; effects.push(fn); }
    },
  };
  const navigation = { addListener: () => () => {}, isFocused: () => true, goBack: () => {}, reset: () => {} };
  const route = { params: { agendamentoId: 44 } };
  const native = Object.fromEntries(['ActivityIndicator', 'ScrollView', 'Text', 'TouchableOpacity', 'View'].map(name => [name, name]));
  native.AppState = { currentState: 'active', addEventListener: () => ({ remove() {} }) };
  const imports = {
    react, 'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../services/agendamentoService': { agendamentoService: {
      buscarPorId: async () => booking,
      cancelar: async (...args) => {
        calls.push(args);
        await Promise.resolve();
        if (fail) throw new Error('Falha ao cancelar');
        booking = { ...booking, status: 'Cancelado' };
        return booking;
      },
    } },
    '../../services/checkinCheckoutService': { checkinCheckoutService: {} },
    '../../services/pagamentoService': { pagamentoService: { buscar: async () => ({ parcelas: [] }) } },
    '../../services/api': { getErrorMessage: error => error.message, ApiError: class extends Error {} },
    './styles': { styles: {} },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/screens/CheckInDiaristaScreen/index.tsx'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, {
    exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; }, setInterval: () => 1, clearInterval: () => {},
  });
  const render = () => {
    cursor = 0;
    const tree = exports.default({ navigation, route });
    while (effects.length) effects.shift()();
    return tree;
  };
  return { render, calls, async ready() { render(); await new Promise(resolve => setImmediate(resolve)); return render(); } };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
}
const cancelButton = tree => nodes(tree).find(node => node.props?.accessibilityLabel === 'Cancelar diária');
const confirm = tree => nodes(tree).find(node => node.type === 'ActionModal' && node.props.title === 'Cancelar diária aceita?');

test('cancelamento exige confirmação; fechar a modal mantém a diária aceita', async () => {
  const h = harness();
  let tree = await h.ready();
  assert.ok(cancelButton(tree));
  cancelButton(tree).props.onPress();
  tree = h.render();
  assert.equal(confirm(tree).props.visible, true);
  assert.equal(h.calls.length, 0);
  confirm(tree).props.onClose();
  tree = h.render();
  assert.equal(confirm(tree).props.visible, false);
  assert.equal(h.calls.length, 0);
});

test('confirmar cancela a diária correta, ignora clique repetido e atualiza a tela', async () => {
  const h = harness();
  let tree = await h.ready();
  cancelButton(tree).props.onPress();
  tree = h.render();
  const first = confirm(tree).props.onConfirm();
  await confirm(tree).props.onConfirm();
  await first;
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0][0], 44);
  tree = h.render();
  assert.equal(cancelButton(tree), undefined);
  assert.ok(nodes(tree).some(node => node.type === 'ActionModal' && node.props.title === 'Diária cancelada' && node.props.visible));
});

test('não oferece cancelar após início, conclusão ou cancelamento', async () => {
  for (const status of ['Em_andamento', 'Concluido', 'Cancelado']) {
    const tree = await harness(status).ready();
    assert.equal(cancelButton(tree), undefined);
  }
});

test('falha de cancelamento mostra modal de erro e mantém a diária aceita', async () => {
  const h = harness('Aceito', true);
  let tree = await h.ready();
  cancelButton(tree).props.onPress();
  tree = h.render();
  await confirm(tree).props.onConfirm();
  tree = h.render();
  assert.ok(cancelButton(tree));
  assert.ok(nodes(tree).some(node => node.type === 'ActionModal' && node.props.variant === 'error' && node.props.visible && node.props.message === 'Falha ao cancelar'));
});
