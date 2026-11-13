const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function mount(list, initialAddresses = [{ id_endereco: 21, cep: '06626-030' }]) {
  let addresses = initialAddresses;
  const focusCallbacks = [];
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
  const navigation = { addListener: (_event, callback) => { focusCallbacks.push(callback); return () => {}; }, navigate() {} };
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
    '../../services/clienteService': { clienteService: { buscarPorId: async () => ({ endereco: addresses }) } },
    '../../utils/serviceFilterDraft': { updateServiceDraft() {} },
    '../../components/location-picker-modal': { LocationPickerModal: 'LocationPickerModal' },
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
  return { flush, requests, nodes, button: label => nodes().find(node => node.props.accessibilityLabel === label),
    setAddresses: value => { addresses = value; }, focus: async () => { await Promise.all(focusCallbacks.map(fn => fn())); await flush(); } };
}

const response = query => ({
  data: Array.from({ length: query.page === 1 ? 10 : 3 }, (_, index) => ({
    id_diarista: (query.page - 1) * 10 + index + 1, id_usuario: index + 1,
    usuario: { nome: 'Teste' }, endereco: [], avaliacao: [],
  })),
  pagination: { page: query.page, limit: 10, total: 13, pages: 2 },
});


test('resposta atrasada da casa anterior não substitui a lista do endereço recém-selecionado', async () => {
  let release;
  const result = (query, nome) => ({
    data: [{ id_diarista: query.id_endereco_origem, id_usuario: 1, usuario: { nome }, distancia_km: 1.2 }],
    pagination: { page: 1, pages: 1, limit: 10, total: 1 },
  });
  const app = mount(query => query.id_endereco_origem === 21
    ? new Promise(resolve => { release = () => resolve(result(query, 'Lista antiga')); })
    : result(query, 'Mais próxima da casa 2'), houses);
  await app.flush();
  app.nodes().find(node => node.type === 'LocationPickerModal').props.onSelect(houses[1]);
  await app.flush();
  release(); await app.flush();
  assert.ok(app.nodes().some(node => node.type === 'Text' && node.children.includes('Mais próxima da casa 2')));
  assert.equal(app.nodes().some(node => node.type === 'Text' && node.children.includes('Lista antiga')), false);
});

const houses = [
  { id_endereco: 21, apelido: 'Casa 1', cep: '06626-030', logradouro: 'Rua Um', numero: 1 },
  { id_endereco: 22, apelido: 'Casa 2', cep: '01001-000', logradouro: 'Rua Dois', numero: 2 },
];
test('escolher outra casa atualiza CEP, mantém pesquisa e volta à primeira página', async () => {
  const app = mount(response, houses);
  await app.flush();
  assert.equal(app.requests.at(-1).cep_origem, houses[0].cep);
  app.nodes().find(node => node.type === 'TextInput' && node.props.accessibilityLabel === 'Buscar diarista pelo nome').props.onChangeText('Nicole');
  await app.flush();
  app.button('Próxima página').props.onPress();
  await app.flush();
  assert.equal(app.requests.at(-1).page, 2);
  app.button('Escolher endereço da minha localização').props.onPress();
  await app.flush();
  let picker = app.nodes().find(node => node.type === 'LocationPickerModal');
  assert.equal(picker.props.visible, true);
  assert.equal(picker.props.addresses.length, 2);
  picker.props.onSelect(houses[1]); picker.props.onClose();
  await app.flush();
  assert.equal(app.requests.at(-1).cep_origem, houses[1].cep);
  assert.equal(app.requests.at(-1).id_endereco_origem, 22);
  assert.equal(app.requests.at(-1).ordenar, 'distancia');
  assert.equal(app.requests.at(-1).page, 1);
  assert.equal(app.requests.at(-1).nome, 'Nicole');
  picker = app.nodes().find(node => node.type === 'LocationPickerModal');
  assert.equal(picker.props.selectedId, 22);
  assert.equal(picker.props.visible, false);
  assert.ok(app.nodes().some(node => node.type === 'Text' && node.children.includes('Casa 2 — Rua Dois, 2')));
  await app.focus();
  assert.equal(app.requests.at(-1).cep_origem, houses[1].cep, 'voltar à tela mantém a casa escolhida');
});
test('recarrega casas novas ao voltar e não busca com endereço inexistente', async () => {
  const app = mount(response, []);
  await app.flush();
  assert.equal(app.requests.length, 0);
  app.setAddresses(houses);
  await app.focus();
  assert.equal(app.nodes().find(node => node.type === 'LocationPickerModal').props.addresses.length, 2);
  assert.equal(app.requests.at(-1).cep_origem, houses[0].cep);
});
test('trocar entre casas com o mesmo CEP também reinicia a paginação e atualiza a seleção', async () => {
  const addresses = [houses[0], { ...houses[1], cep: houses[0].cep }];
  const app = mount(response, addresses);
  await app.flush();
  app.button('Próxima página').props.onPress(); await app.flush();
  app.nodes().find(node => node.type === 'LocationPickerModal').props.onSelect(addresses[1]);
  await app.flush();
  assert.equal(app.requests.at(-1).page, 1);
  assert.equal(app.nodes().find(node => node.type === 'LocationPickerModal').props.selectedId, 22);
});
test('modal mostra as casas, marca a seleção e possui atalho para gerenciar endereços', () => {
  const exports = {}, calls = [];
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/components/location-picker-modal/index.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports, require: name => name === 'react' ? { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) }
    : name === 'react-native' ? { ...Object.fromEntries(['ActivityIndicator','Modal','ScrollView','Text','TouchableOpacity','View'].map(key => [key, key])), StyleSheet: { create: value => value } }
    : { Ionicons: 'Icon' } });
  const tree = exports.LocationPickerModal({ visible: true, addresses: houses, selectedId: 21, loading: false, onSelect: address => calls.push(address.id_endereco), onClose: () => calls.push('close'), onManage: () => calls.push('manage') });
  const nodes = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(nodes)];
  const radios = nodes(tree).filter(node => node.props.accessibilityRole === 'radio');
  assert.equal(radios.length, 2);
  assert.equal(radios[0].props.accessibilityState.checked, true);
  radios[1].props.onPress();
  assert.deepEqual(calls, [22, 'close']);
  nodes(tree).find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes('Cadastrar ou editar casas'))).props.onPress();
  assert.deepEqual(calls.slice(-2), ['close', 'manage']);
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
  const search = app.nodes().find(node => node.type === 'TextInput' && node.props.accessibilityLabel === 'Buscar diarista pelo nome');
  search.props.onChangeText('Nicole');
  await app.flush();
  assert.equal(app.requests.at(-1).page, 1);
  assert.equal(app.requests.at(-1).nome, 'Nicole');
  release();
  await app.flush();
  assert.equal(app.button('Página anterior').props.disabled, true);
  assert.equal(app.nodes().filter(node => node.props.onPress && node.props.activeOpacity === 0.85).length, 10);
});

