const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function harness(reviews, appointments) {
  let cursor = 0, response = reviews, focus;
  const slots = [], effects = [], requests = [], navigations = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous[i])) { slots[index] = deps; effects.push(fn); }
    },
  };
  const navigation = { addListener: (event, callback) => { focus = callback; return () => {}; }, goBack: () => {}, navigate: (...args) => navigations.push(args) };
  const native = Object.fromEntries(['ActivityIndicator', 'Image', 'TextInput', 'ScrollView', 'Text', 'TouchableOpacity', 'View'].map(name => [name, name]));
  function utility(file) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports });
    return exports;
  }
  const imports = {
    '../../utils/historyFilters': utility('src/utils/historyFilters.ts'),
    '../../utils/inputMasks': utility('src/utils/inputMasks.ts'),
    react, 'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../services/agendamentoService': { agendamentoService: { listar: async (query) => {
      requests.push(query);
      const data = appointments ?? [
      { id_agendamento: 1, data_agendamento: '2099-01-12', status: 'Concluido', cliente: { usuario: { nome: 'Cliente de teste' } }, avaliacao: response },
      { id_agendamento: 2, data_agendamento: '2099-01-13', status: 'Concluido', avaliacao: [{ autor_tipo: 'Diarista', nota: 5, comentario: 'Não exibir como avaliação recebida' }] },
    ];
      const page = query.page ?? 1;
      return { data: data.slice((page - 1) * 100, page * 100), pagination: { pages: Math.ceil(data.length / 100) } };
    } } },
    '../../services/api': { getErrorMessage: error => error.message },
    './styles': { styles: {} },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/screens/HistoricoDiaristaScreen/index.tsx'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, {
    exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; },
  });
  const render = () => {
    cursor = 0;
    const tree = exports.default({ navigation });
    while (effects.length) effects.shift()();
    return tree;
  };
  return {
    render, requests, navigations,
    async ready() { render(); await new Promise(resolve => setImmediate(resolve)); return render(); },
    async refresh(reviews) { response = reviews; focus(); await new Promise(resolve => setImmediate(resolve)); return render(); },
  };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
}
const texts = tree => nodes(tree).filter(node => node.type === 'Text').map(node => node.props.children.flat(Infinity).join(''));
const review = (nota, comentario) => ({ id_avaliacao: 1, autor_tipo: 'Cliente', nota, comentario, anonima: false });

test('histórico mostra nota, estrelas e comentário na diária correta, não uma avaliação sobre o cliente', async () => {
  const tree = await harness([review(3, 'Limpeza muito bem feita.')]).ready();
  const labels = texts(tree);
  assert.ok(labels.includes('Avaliação recebida do cliente'));
  assert.ok(labels.includes('3,0 / 5'));
  assert.ok(labels.includes('Limpeza muito bem feita.'));
  assert.ok(labels.includes('Esta diária ainda não foi avaliada pelo cliente.'));
  assert.equal(labels.includes('Não exibir como avaliação recebida'), false);
  const stars = nodes(tree).filter(node => node.type === 'Icon' && node.props.name.startsWith('star'));
  assert.equal(stars.filter(node => node.props.name === 'star').length, 3);
  assert.equal(stars.filter(node => node.props.name === 'star-outline').length, 2);
});

test('nota zero não vira ausência; nota fracionada usa meia estrela; comentário vazio tem indicação', async () => {
  for (const nota of [0, 4.5]) {
    const tree = await harness([review(nota, '   ')]).ready();
    assert.ok(texts(tree).includes(nota.toFixed(1).replace('.', ',') + ' / 5'));
    assert.ok(texts(tree).includes('O cliente não deixou um comentário.'));
    const icons = nodes(tree).filter(node => node.type === 'Icon');
    assert.equal(icons.filter(node => node.props.name === 'star-half').length, nota === 4.5 ? 1 : 0);
  }
});

test('voltar ao histórico carrega a avaliação recém-enviada sem misturar as diárias', async () => {
  const h = harness([]);
  let tree = await h.ready();
  assert.equal(texts(tree).filter(text => text === 'Esta diária ainda não foi avaliada pelo cliente.').length, 2);
  tree = await h.refresh([review(5, 'Novo comentário')]);
  assert.ok(texts(tree).includes('5,0 / 5'));
  assert.ok(texts(tree).includes('Novo comentário'));
  assert.equal(texts(tree).filter(text => text === 'Esta diária ainda não foi avaliada pelo cliente.').length, 1);
});

const appointments = () => Array.from({ length: 23 }, (_, index) => ({
  id_agendamento: index + 1, data_agendamento: '2026-11-01', horario_inicio: '08:00',
  status: index === 22 ? 'Expirado' : 'Aceito', checkin_expirado: index === 22,
  cliente: { usuario: { nome: index < 20 ? 'Rafael' : 'Nicole' } },
  agendamento_servico: [{ diarista_servico: { servico: { nome_servico: 'Limpeza de janelas' } } }],
  valor_estimado: 120,
}));
test('diarista pagina dez por vez, muda de página e volta à primeira ao pesquisar cliente', async () => {
  const h = harness([], appointments());
  let tree = await h.ready();
  const button = label => nodes(tree).find(node => node.props.accessibilityLabel === label);
  const countCards = () => texts(tree).filter(text => text.startsWith('DIÁRIA #')).length;
  assert.equal(countCards(), 10);
  assert.ok(texts(tree).includes('Página 1 de 3'));
  button('Próxima página').props.onPress();
  tree = h.render();
  assert.ok(texts(tree).includes('Página 2 de 3'));
  button('Próxima página').props.onPress();
  tree = h.render();
  assert.equal(countCards(), 3);
  assert.equal(button('Próxima página').props.disabled, true);
  button('Buscar no histórico').props.onChangeText('Nicole');
  tree = h.render();
  assert.equal(countCards(), 3);
  assert.equal(button('Próxima página'), undefined);
  button('Buscar no histórico').props.onChangeText('');
  tree = h.render();
  assert.ok(texts(tree).includes('Página 1 de 3'));
});
test('diarista combina status e data, separa check-in expirado e permite limpar os filtros', async () => {
  const h = harness([], appointments());
  let tree = await h.ready();
  const status = nodes(tree).find(node => node.type === 'TouchableOpacity' && node.props.children.some(child => child?.type === 'Text' && child.props.children.includes('Check-in expirado')));
  status.props.onPress();
  tree = h.render();
  assert.equal(texts(tree).filter(text => text.startsWith('DIÁRIA #')).length, 1);
  nodes(tree).find(node => node.props.accessibilityLabel === 'Filtrar por data da diária').props.onChangeText('02112026');
  tree = h.render();
  assert.ok(texts(tree).includes('Nenhuma diária com esses filtros'));
  nodes(tree).find(node => node.type === 'TouchableOpacity' && node.props.children.some(child => child?.type === 'Text' && child.props.children.includes('Limpar filtros'))).props.onPress();
  tree = h.render();
  assert.equal(texts(tree).filter(text => text.startsWith('DIÁRIA #')).length, 10);
});
test('carrega todas as páginas da API para pesquisar registros além do centésimo', async () => {
  const records = Array.from({ length: 101 }, (_, index) => ({
    id_agendamento: index + 1, data_agendamento: '2026-11-01', status: 'Concluido',
    cliente: { usuario: { nome: index === 100 ? 'Último cliente' : 'Cliente comum' } },
  }));
  const h = harness([], records);
  let tree = await h.ready();
  assert.deepEqual(h.requests.map(query => query.page ?? 1), [1, 2]);
  nodes(tree).find(node => node.props.accessibilityLabel === 'Buscar no histórico').props.onChangeText('ultimo cliente');
  tree = h.render();
  assert.ok(texts(tree).includes('DIÁRIA #101'));
  assert.equal(texts(tree).filter(text => text.startsWith('DIÁRIA #')).length, 1);
});

test('ações da diarista abrem a diária correta; finalização mantém fluxo de checkout', async () => {
  const records = appointments().slice(0, 1);
  records[0].status = 'Em_andamento';
  const h = harness([], records);
  const tree = await h.ready();
  const action = nodes(tree).find(node => node.type === 'TouchableOpacity' && node.props.children.some(child => child?.type === 'Text' && child.props.children.includes('Finalizar diária')));
  assert.ok(action);
  action.props.onPress();
  assert.equal(h.navigations[0][0], 'CheckInDiarista');
  assert.equal(h.navigations[0][1].agendamentoId, 1);
});
