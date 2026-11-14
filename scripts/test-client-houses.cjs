const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), ts = require(path.join(root, 'node_modules/typescript'));
function load(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText,
    { exports, Date, Intl, require: name => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; } });
  return exports;
}
const houses = [
  { id_endereco: 21, apelido: 'Casa 1', qtd_comodos: 3, tamanho_casa: 'pequena', logradouro: 'Rua Um', numero: 1, bairro: 'Centro', cep: '01001-000' },
  { id_endereco: 22, apelido: 'Casa 2', qtd_comodos: 8, tamanho_casa: 'grande', logradouro: 'Rua Dois', numero: 2, bairro: 'Centro', cep: '01001-000' },
];
const houseModule = load('src/utils/selectedHouse.ts');
test('uma casa é automática; com várias casas a seleção é obrigatória e ID inválido não escolhe a primeira', () => {
  assert.equal(houseModule.selectedHouse([], null), null);
  assert.equal(houseModule.selectedHouse([houses[0]], null).id_endereco, 21);
  assert.equal(houseModule.selectedHouse(houses, null), null);
  assert.equal(houseModule.selectedHouse(houses, 999), null);
  assert.equal(houseModule.selectedHouse(houses, 22).qtd_comodos, 8);
});
function hooks() {
  let cursor = 0;
  const slots = [], effects = [];
  return {
    react: {
      createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
      useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
      useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
      useMemo(fn) { return fn(); },
      useEffect(fn, deps) { const index = cursor++, previous = slots[index]; if (!previous || deps.some((value, i) => value !== previous.deps[i])) { previous?.cleanup?.(); slots[index] = { deps }; effects.push(() => { slots[index].cleanup = fn(); }); } },
    },
    begin() { cursor = 0; }, flush() { while (effects.length) effects.shift()(); },
  };
}
const walk = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(walk)];
const native = Object.fromEntries(['ActivityIndicator','ScrollView','Text','TextInput','TouchableOpacity','View'].map(name => [name, name]));
async function bookingHarness(addresses) {
  const h = hooks(), estimates = [], bookings = [];
  const user = { cliente: [{ id_cliente: 2 }] };
  const profile = { id_diarista: 8, disponibilidade_diarista: [{ id_agenda: 31, disponivel: true, dia_semana: '2099-01-01', horario_inicio: '09:00', horario_fim: '10:00' }], combo_base: [], diarista_servico: [{ id_diarista_servico: 3, id_servico: 4, preco: 100, servico: { nome_servico: 'Limpar' } }] };
  const navigation = { addListener: () => () => {}, navigate() {}, goBack() {} };
  const Screen = load('src/screens/AgendarDiariaScreen/index.tsx', {
    react: h.react, 'react-native': native, 'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' }, '@expo/vector-icons': { Ionicons: 'Icon' }, './styles': { styles: {} },
    '../../utils/selectedHouse': houseModule, '../../components/page-header': require('./page-header-fixture.cjs'),
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../contexts/GlobalContext': { useAuth: () => ({ user }) },
    '../../services/api': { getErrorMessage: error => error.message },
    '../../services/clienteService': { clienteService: { buscarPorId: async () => ({ id_cliente: 2, qtd_comodos: 99, tamanho_casa: 'media', endereco: addresses }) } },
    '../../services/diaristaService': { diaristaService: { buscarPorId: async () => profile } },
    '../../services/agendamentoService': { agendamentoService: {
      estimar: async payload => { estimates.push(payload); return { valor_estimado: 100 }; },
      criar: async payload => { bookings.push(payload); return { id_agendamento: 44 }; },
    } },
  }).default;
  let nodes = [];
  function render() { h.begin(); nodes = walk(Screen({ navigation, route: { params: { diaristaId: 8 } } })); h.flush(); return nodes; }
  async function flush() { for (let i = 0; i < 4; i++) { render(); await new Promise(resolve => setImmediate(resolve)); } return render(); }
  function button(label) { return nodes.find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes(label))); }
  await flush();
  return { render, flush, estimates, bookings, button, get nodes() { return nodes; } };
}
test('com várias casas não calcula nem envia até selecionar; resumo e solicitação usam a Casa 2', async () => {
  const h = await bookingHarness(houses);
  assert.equal(h.nodes.filter(node => node.props.accessibilityRole === 'radio').length, 2);
  assert.ok(h.nodes.filter(node => node.props.accessibilityRole === 'radio').every(node => node.props.accessibilityState.checked === false));
  h.button('Limpar').props.onPress();
  await h.flush();
  assert.equal(h.estimates.length, 0);
  assert.equal(h.button('Confirmar Agendamento').props.disabled, true);
  h.nodes.filter(node => node.props.accessibilityRole === 'radio')[1].props.onPress();
  await h.flush();
  h.button('Limpar').props.onPress();
  await h.flush();
  assert.equal(h.estimates.at(-1).id_endereco, 22);
  assert.equal(h.estimates.at(-1).qtd_comodos, 8);
  assert.equal(h.estimates.at(-1).tamanho_residencia, 'grande');
  h.button('Confirmar Agendamento').props.onPress();
  h.render();
  const modal = h.nodes.find(node => node.type === 'ActionModal' && node.props.title === 'Enviar solicitação?');
  assert.ok(modal.props.visible);
  assert.match(modal.props.message, /Casa 2.*Rua Dois/);
  assert.equal(h.bookings.length, 0);
  await modal.props.onConfirm();
  assert.equal(h.bookings[0].id_endereco, 22);
});
test('casa única é automática e usa seus dados próprios, não os valores antigos do cliente', async () => {
  const h = await bookingHarness([houses[0]]);
  assert.equal(h.nodes.find(node => node.props.accessibilityRole === 'radio').props.accessibilityState.checked, true);
  h.button('Limpar').props.onPress();
  await h.flush();
  assert.equal(h.estimates.at(-1).qtd_comodos, 3);
  assert.equal(h.estimates.at(-1).tamanho_residencia, 'pequena');
});
test('cadastro e edição salvam dados por endereço, sem sobrescrever a outra casa', async () => {
  const h = hooks(), writes = [];
  const Houses = load('src/components/client-houses/index.tsx', {
    react: h.react, 'react-native': { ...native, StyleSheet: { create: value => value } }, '@expo/vector-icons': { Ionicons: 'Icon' },
    '../profile-edit-modal': { ProfileEditModal: 'ProfileEditModal' },
    '../../services/enderecoService': { enderecoService: { criar: async data => writes.push({ create: data }), atualizar: async (id, data) => writes.push({ id, data }) } },
  }).ClientHouses;
  const props = { cliente: { id_cliente: 2, endereco: houses, qtd_comodos: 99, tamanho_casa: 'media' }, onUpdated: async () => {} };
  function render() { h.begin(); return walk(Houses(props)); }
  let nodes = render();
  nodes.find(node => node.props.accessibilityLabel === 'Editar Casa 2').props.onPress();
  nodes = render();
  let modal = nodes.find(node => node.type === 'ProfileEditModal');
  assert.equal(modal.props.initialValues.qtd_comodos, '8');
  assert.equal(modal.props.initialValues.tamanho_casa, 'grande');
  const values = { ...modal.props.initialValues, apelido: 'Casa reformada', qtd_comodos: '9', tamanho_casa: 'grande', cep: '01001-000', logradouro: 'Rua Dois', numero: '2', complemento: '', bairro: 'Centro', cidade: 'São Paulo', estado: 'sp', referencia: '' };
  await modal.props.onSave(values);
  assert.equal(writes[0].id, 22);
  assert.equal(writes[0].data.qtd_comodos, 9);
  modal.props.onClose();
  nodes = render();
  nodes.find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes('Adicionar'))).props.onPress();
  nodes = render();
  modal = nodes.find(node => node.type === 'ProfileEditModal');
  await modal.props.onSave({ ...values, apelido: 'Casa 3' });
  assert.equal(writes[1].create.id_cliente, 2);
  assert.equal(writes[1].create.apelido, 'Casa 3');
  assert.equal(houses[0].qtd_comodos, 3);
});

