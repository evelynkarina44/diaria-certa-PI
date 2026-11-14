const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
function harness(count) {
  const slots = [], effects = []; let cursor = 0, scrolls = 0;
  const services = Array.from({ length: count }, (_, i) => ({ id_diarista_servico: i + 100, id_servico: i + 1, preco: 100, servico: { nome_servico: 'Serviço ' + (i + 1), descricao: i % 2 ? 'Limpeza básica' : 'Faxina completa' } }));
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
    '../../services/diaristaService': { diaristaService: { buscarPorId: async () => ({ diarista_servico: services }) } },
    '../../services/servicoService': {}, '../../services/diaristaServicoService': {},
    '../../services/api': { getErrorMessage: e => e.message }, './styles': { styles: {} },
    '../../utils/currency': { formatCurrencyValue: String, parseCurrencyInput: Number },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/screens/ServicosDiaristaScreen/index.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText, { exports, React: react, require: n => { if (!(n in imports)) throw Error(n); return imports[n]; } });
  let nodes = [];
  const walk = n => !n || typeof n !== 'object' ? [] : [n, ...(n.children ?? []).flat(Infinity).flatMap(walk)];
  function render() { cursor = 0; nodes = walk(exports.default({ navigation: {} })); while (effects.length) effects.shift()(); return nodes; }
  return {
    render, async ready() { render(); await new Promise(r => setImmediate(r)); return render(); },
    button: label => nodes.find(n => n.props.accessibilityLabel === label),
    ids: () => nodes.filter(n => n.props.accessibilityLabel?.startsWith('Editar Serviço ')).map(n => Number(n.props.accessibilityLabel.replace('Editar Serviço ', ''))),
    get scrolls() { return scrolls; },
  };
}

test('serviços paginam dez por vez, preservam limites e retornam ao topo', async () => {
  const h = harness(23); await h.ready();
  assert.deepEqual(h.ids(), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(h.button('Página anterior de serviços').props.disabled, true);
  h.button('Próxima página de serviços').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [11,12,13,14,15,16,17,18,19,20]);
  h.button('Próxima página de serviços').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [21,22,23]);
  assert.equal(h.button('Próxima página de serviços').props.disabled, true);
  h.button('Página anterior de serviços').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [11,12,13,14,15,16,17,18,19,20]);
  assert.equal(h.scrolls, 3);
});
test('pesquisa todos os serviços por nome ou descrição antes de paginar e ignora acentos', async () => {
  const h = harness(23); await h.ready();
  h.button('Próxima página de serviços').props.onPress(); h.render();
  h.button('Buscar serviços').props.onChangeText('BASICA'); h.render();
  assert.deepEqual(h.ids(), [2,4,6,8,10,12,14,16,18,20]);
  h.button('Próxima página de serviços').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [22]);
  h.button('Buscar serviços').props.onChangeText('Serviço 23'); h.render();
  assert.deepEqual(h.ids(), [23]);
  assert.equal(h.button('Próxima página de serviços'), undefined);
  h.button('Buscar serviços').props.onChangeText('inexistente'); h.render();
  assert.deepEqual(h.ids(), []);
  h.button('Limpar busca de serviços').props.onPress(); h.render();
  assert.deepEqual(h.ids(), [1,2,3,4,5,6,7,8,9,10]);
});
test('lista vazia ou com até dez serviços não exibe paginação', async () => {
  for (const count of [0,1,10]) {
    const h = harness(count); await h.ready();
    assert.equal(h.ids().length, count);
    assert.equal(h.button('Próxima página de serviços'), undefined);
  }
});
