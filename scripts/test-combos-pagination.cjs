const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
function harness(count) {
  const slots = [], effects = []; let cursor = 0, scrolls = 0;
  const combos = Array.from({ length: count }, (_, i) => ({ id_combo_base: i + 1, nome_combo: 'Combo ' + (i + 1), descricao: i % 2 ? 'Limpeza básica' : 'Faxina completa', valor_base: 100, qtd_comodos_casa: 3, combo_servico: [] }));
  const user = { diarista: [{ id_diarista: 1 }] };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
    useRef() { const i = cursor++; return slots[i] ??= { current: { scrollTo() { scrolls++; } } }; },
    useCallback(fn) { return fn; },
    useEffect(fn, deps) { const i = cursor++, prev = slots[i]; if (!prev || deps.some((v, n) => v !== prev[n])) { slots[i] = deps; effects.push(fn); } },
  };
  const imports = {
    react, 'react-native': Object.fromEntries(['ActivityIndicator','ScrollView','Text','TextInput','TouchableOpacity','View'].map(n => [n, n])),
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' }, '@expo/vector-icons': { Ionicons: 'Icon' },
    '../../components/page-header': { PageHeader: 'PageHeader' }, '../../components/header-menu': { HeaderMenu: 'HeaderMenu' },
    '../../components/profile-edit-modal': { ProfileEditModal: 'ProfileEditModal' },
    '../../contexts/GlobalContext': { useAuth: () => ({ user }) },
    '../../services/diaristaService': { diaristaService: { buscarPorId: async () => ({ combo_base: combos, diarista_servico: [] }) } },
    '../../services/comboBaseService': {}, '../../services/comboServicoService': {},
    '../../services/api': { getErrorMessage: e => e.message }, './styles': { styles: {} },
    '../../utils/currency': { formatCurrencyValue: String, parseCurrencyInput: Number },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/screens/CombosDiaristaScreen/index.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText, { exports, React: react, require: n => { if (!(n in imports)) throw Error(n); return imports[n]; } });
  let nodes = [];
  const walk = n => !n || typeof n !== 'object' ? [] : [n, ...(n.children ?? []).flat(Infinity).flatMap(walk)];
  function render() { cursor = 0; nodes = walk(exports.default({ navigation: {} })); while (effects.length) effects.shift()(); return nodes; }
  return {
    render, async ready() { render(); await new Promise(r => setImmediate(r)); return render(); },
    button: label => nodes.find(n => n.props.accessibilityLabel === label),
    ids: () => nodes.filter(n => n.props.accessibilityLabel?.startsWith('Editar Combo ')).map(n => Number(n.props.accessibilityLabel.slice(13))),
    get scrolls() { return scrolls; },
  };
}
test('combos mostram cinco por página, sem repetir, com limites e retorno ao topo', async () => {
  const h = harness(12); await h.ready();
  assert.deepEqual(h.ids(), [1,2,3,4,5]);
  assert.equal(h.button('Página anterior de combos').props.disabled, true);
  h.button('Próxima página de combos').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [6,7,8,9,10]);
  h.button('Próxima página de combos').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [11,12]);
  assert.equal(h.button('Próxima página de combos').props.disabled, true);
  h.button('Página anterior de combos').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [6,7,8,9,10]);
  assert.equal(h.scrolls, 3);
});
test('até cinco combos não exibem controles; estado vazio permanece disponível', async () => {
  for (const count of [0,1,5]) {
    const h = harness(count); await h.ready();
    assert.equal(h.ids().length, count);
    assert.equal(h.button('Próxima página de combos'), undefined);
    assert.equal(h.button('Página anterior de combos'), undefined);
  }
});

test('busca toda a lista antes de paginar, ignora acentos e retorna à primeira página', async () => {
  const h = harness(12); await h.ready();
  h.button('Próxima página de combos').props.onPress(); h.render();
  h.button('Buscar combos').props.onChangeText('BASICA'); h.render();
  assert.deepEqual(h.ids(), [2,4,6,8,10]);
  h.button('Próxima página de combos').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [12]);
  h.button('Buscar combos').props.onChangeText('Combo 11'); h.render();
  assert.deepEqual(h.ids(), [11]);
  assert.equal(h.button('Próxima página de combos'), undefined);
  h.button('Buscar combos').props.onChangeText('inexistente'); h.render();
  assert.deepEqual(h.ids(), []);
  h.button('Limpar busca de combos').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [1,2,3,4,5]);
});
