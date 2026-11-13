const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function mount(list) {
  let cursor = 0, tree, dirty = true;
  const slots = [], effects = [], timers = new Map(), requests = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: initial };
      return [slots[index].value, value => {
        const next = typeof value === 'function' ? value(slots[index].value) : value;
        if (!Object.is(next, slots[index].value)) { slots[index].value = next; dirty = true; }
      }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        previous?.cleanup?.();
        slots[index] = { deps };
        effects.push(() => { slots[index].cleanup = fn(); });
      }
    },
  };
  const navigation = { addListener: () => () => {}, navigate() {} };
  const user = { id_usuario: 99, activeProfile: 'CLIENTE', nome: 'Cliente', cliente: [{ id_cliente: 1 }] };
  const exports = {};
  const dependencies = {
    react, 'react-native': Object.fromEntries(['ActivityIndicator', 'Image', 'ScrollView', 'Text', 'TextInput', 'TouchableOpacity', 'View'].map(key => [key, key])),
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ bottom: 0, right: 0 }) },
    '@expo/vector-icons': { Ionicons: 'Ionicons' }, './styles': { styles: {} },
    '../../contexts/GlobalContext': { useAuth: () => ({ user }) },
    '../../services/api': { getErrorMessage: error => error.message },
    '../../services/diaristaService': { diaristaService: { listar: async query => { requests.push(query); return list(query); } } },
    '../../services/favoritoService': { favoritoService: { listar: async () => ({ data: [] }) } },
    '../../services/clienteService': { clienteService: { buscarPorId: async () => ({ endereco: [{ cep: '06626-030' }] }) } },
    '../../utils/serviceFilterDraft': { updateServiceDraft() {} },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/screens/EncontrarDiaristaScreen/index.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports, require: name => dependencies[name] ?? {}, setTimeout: fn => { const id = Symbol(); timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id) });
  async function flush() {
    for (let i = 0; i < 12; i++) {
      if (dirty) { dirty = false; cursor = 0; tree = exports.default({ navigation }); }
      while (effects.length) effects.shift()();
      await Promise.resolve();
      if (!dirty) { for (const [id, fn] of timers) { timers.delete(id); fn(); } }
      await Promise.resolve();
    }
    return tree;
  }
  function nodes(node = tree) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(nodes);
    return [node, ...node.children.flatMap(nodes)];
  }
  return { flush, requests, nodes, button: label => nodes().find(node => node.props.accessibilityLabel === label) };
}

const response = query => ({
  data: Array.from({ length: query.page === 1 ? 10 : 3 }, (_, index) => ({
    id_diarista: (query.page - 1) * 10 + index + 1, id_usuario: index + 1,
    usuario: { nome: 'Teste' }, endereco: [], avaliacao: [],
  })),
  pagination: { page: query.page, limit: 10, total: 13, pages: 2 },
});

test('busca somente 10 por página, navega sem pré-carregar outras páginas e respeita limites', async () => {
  const app = mount(response);
  await app.flush();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].page, 1);
  assert.equal(app.requests[0].limit, 10);
  assert.equal(app.button('Página anterior').props.disabled, true);
  app.button('Próxima página').props.onPress();
  await app.flush();
  assert.equal(app.requests.length, 2);
  assert.equal(app.requests[1].page, 2);
  assert.equal(app.button('Próxima página').props.disabled, true);
  app.button('Página anterior').props.onPress();
  await app.flush();
  assert.equal(app.requests[2].page, 1);
});

test('nova pesquisa volta à primeira página e não mistura respostas antigas', async () => {
  let release;
  const app = mount(query => query.page === 2
    ? new Promise(resolve => { release = () => resolve(response(query)); })
    : response(query));
  await app.flush();
  app.button('Próxima página').props.onPress();
  await app.flush();
  const search = app.nodes().find(node => node.type === 'TextInput' && node.props.placeholder?.startsWith('Buscar diaristas'));
  search.props.onChangeText('Nicole');
  await app.flush();
  assert.equal(app.requests.at(-1).page, 1);
  assert.equal(app.requests.at(-1).nome, 'Nicole');
  release();
  await app.flush();
  assert.equal(app.button('Página anterior').props.disabled, true);
  assert.equal(app.nodes().filter(node => node.props.onPress && node.props.activeOpacity === 0.85).length, 10);
});

