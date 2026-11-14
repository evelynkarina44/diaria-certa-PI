const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function harness(fail = false) {
  const slots = [], effects = [], calls = [];
  let cursor = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useMemo(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) slots[index] = { deps, value: fn() };
      return slots[index].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous[i])) { slots[index] = deps; effects.push(fn); }
    },
  };
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-11-11T12:00:00Z'])); }
    static now() { return new Date('2026-11-11T12:00:00Z').getTime(); }
  }
  const row = (time, id) => ({ id_agenda: id, id_diarista: 8, dia_semana: '2026-11-20T00:00:00.000Z', horario_inicio: '1970-01-01T' + time + ':00.000Z' });
  const initial = [row('09:00', 1), row('11:00', 2)];
  const api = {
    listar: async () => initial,
    salvarMes: async data => {
      calls.push(JSON.parse(JSON.stringify(data)));
      if (fail) throw new Error('Falha simulada');
      return data.dias.flatMap(day => data.horarios.map((time, index) => ({ ...row(time, index + 10), dia_semana: day })));
    },
    criar: () => { throw new Error('Não deve gravar horários individualmente'); },
    remover: () => { throw new Error('Não deve apagar horários individualmente'); },
  };
  const native = Object.fromEntries(['ActivityIndicator', 'ScrollView', 'Text', 'TextInput', 'TouchableOpacity', 'View'].map(name => [name, name]));
  const imports = {
    react, 'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    '../../components/page-header': require('./page-header-fixture.cjs'),
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../components/header-menu': { HeaderMenu: 'HeaderMenu' },
    '../../contexts/GlobalContext': { useAuth: () => ({ user: { diarista: [{ id_diarista: 8 }] } }) },
    '../../services/disponibilidadeService': { disponibilidadeService: api },
    '../../services/api': { getErrorMessage: error => error.message },
    '../../utils/inputMasks': { formatTime: value => value },
    './styles': { styles: {} },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/screens/AgendaDiaristaScreen/index.tsx'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, {
    exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; }, Date: TestDate, Intl,
  });
  const render = () => {
    cursor = 0;
    const tree = exports.default({ navigation: {} });
    while (effects.length) effects.shift()();
    return tree;
  };
  return { render, calls, async ready() { render(); await new Promise(resolve => setImmediate(resolve)); render(); return render(); } };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
}
const input = tree => nodes(tree).find(node => node.type === 'TextInput');
const modal = tree => nodes(tree).find(node => node.type === 'ActionModal');
const accessible = (tree, label) => nodes(tree).find(node => node.props?.accessibilityLabel === label);
const button = (tree, label) => nodes(tree).find(node => node.type === 'TouchableOpacity' && nodes(node).some(child => child.type === 'Text' && child.props.children.includes(label)));

test('editar um horário substitui somente ele e salva o mês em uma única chamada', async () => {
  const h = harness();
  let tree = await h.ready();
  accessible(tree, 'Editar 09:00').props.onPress();
  tree = h.render();
  assert.equal(input(tree).props.value, '09:00');
  input(tree).props.onChangeText('09:30');
  tree = h.render();
  input(tree).props.onSubmitEditing();
  tree = h.render();
  assert.ok(accessible(tree, 'Editar 09:30'));
  assert.ok(accessible(tree, 'Editar 11:00'));
  assert.equal(accessible(tree, 'Editar 09:00'), undefined);
  await button(tree, 'Salvar alterações').props.onPress();
  assert.deepEqual(h.calls, [{ mes: '2026-11', dias: ['2026-11-20'], horarios: ['09:30', '11:00'] }]);
  tree = h.render();
  assert.equal(modal(tree).props.variant, 'success');
  assert.equal(modal(tree).props.visible, true);
});

test('dias podem ser trocados no calendário sem retirar horários cadastrados', async () => {
  const h = harness();
  let tree = await h.ready();
  nodes(tree).find(node => node.props?.key === '2026-11-20').props.onPress();
  tree = h.render();
  nodes(tree).find(node => node.props?.key === '2026-11-21').props.onPress();
  tree = h.render();
  await button(tree, 'Salvar alterações').props.onPress();
  assert.deepEqual(h.calls[0], { mes: '2026-11', dias: ['2026-11-21'], horarios: ['09:00', '11:00'] });
});

test('erro mantém o rascunho e informa a falha na modal padrão', async () => {
  const h = harness(true);
  let tree = await h.ready();
  accessible(tree, 'Editar 09:00').props.onPress();
  tree = h.render();
  input(tree).props.onChangeText('08:00');
  tree = h.render();
  input(tree).props.onSubmitEditing();
  tree = h.render();
  await button(tree, 'Salvar alterações').props.onPress();
  tree = h.render();
  assert.equal(modal(tree).props.variant, 'error');
  assert.equal(modal(tree).props.message, 'Falha simulada');
  assert.ok(accessible(tree, 'Editar 08:00'));
  assert.ok(accessible(tree, 'Editar 11:00'));
});
