const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require(path.join(__dirname, '../node_modules/typescript'));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/screens/HistoricoClienteScreen/index.tsx'), 'utf8').replace(/\r\n/g, '\n');
function compile(code, context = {}) {
  vm.createContext(context);
  vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText, context);
  return context;
}
const { filterHistory, paginateHistory } = compile(fs.readFileSync(path.join(root, 'src/utils/historyFilters.ts'), 'utf8'), { exports: {} }).exports;
const items = [
  { id: 40, nome: 'Rafael Sá', servicos: 'Limpeza de janelas', status: 'Aceito', dataISO: '2026-11-01T00:00:00Z', horario: '08:00' },
  { id: 44, nome: 'Rafael Sá', servicos: 'Passar pano', status: 'Expirado', checkinExpirado: true, dataISO: '2026-11-10T00:00:00Z', horario: '09:00' },
  { id: 45, nome: 'Nicole Lima', status: 'Expirado', dataISO: '2026-10-01T00:00:00Z', horario: '10:00' },
  { id: 46, nome: 'Nicole Lima', status: 'Concluido', dataISO: '2026-11-01T00:00:00Z', horario: '18:00' },
];
const ids = result => Array.from(result, item => item.id);
test('busca por nome sem acentos, serviço e número; combina termos e filtros', () => {
  assert.deepEqual(ids(filterHistory(items, 'rafael sa', 'Todos', '', 'recentes')), [44, 40]);
  assert.deepEqual(ids(filterHistory(items, 'janelas', 'Aceito', '01/11/2026', 'recentes')), [40]);
  assert.deepEqual(ids(filterHistory(items, '44', 'Todos', '', 'recentes')), [44]);
  assert.equal(filterHistory(items, 'Nicole janelas', 'Todos', '', 'recentes').length, 0);
});
test('check-in expirado tem filtro próprio, separado da solicitação expirada', () => {
  assert.deepEqual(ids(filterHistory(items, '', 'Checkin_expirado', '', 'recentes')), [44]);
  assert.deepEqual(ids(filterHistory(items, '', 'Expirado', '', 'recentes')), [45]);
  assert.deepEqual(ids(filterHistory(items, '', 'Concluido', '', 'recentes')), [46]);
});
test('filtra dia, dia/mês ou data completa sem deslocamento de fuso', () => {
  assert.deepEqual(ids(filterHistory(items, '', 'Todos', '01', 'recentes')), [46, 40, 45]);
  assert.deepEqual(ids(filterHistory(items, '', 'Todos', '01/11', 'recentes')), [46, 40]);
  assert.deepEqual(ids(filterHistory(items, '', 'Todos', '10/11/2026', 'recentes')), [44]);
  assert.equal(filterHistory(items, '', 'Todos', '31/02/2026', 'recentes').length, 0);
});
test('ordena por dia e horário, mantém origem intacta, suporta vazio', () => {
  assert.deepEqual(ids(filterHistory(items, '', 'Todos', '', 'recentes')), [44, 46, 40, 45]);
  assert.deepEqual(ids(filterHistory(items, '', 'Todos', '', 'antigos')), [45, 40, 46, 44]);
  assert.deepEqual(items.map(item => item.id), [40, 44, 45, 46]);
  assert.equal(filterHistory([], '', 'Todos', '', 'recentes').length, 0);
});
test('histórico carrega todas as páginas antes de filtrar e preserva favoritos', async () => {
  const start = source.indexOf('  async function carregarDados()');
  const end = source.indexOf('  async function alternarFavorito', start);
  const requested = [], state = {};
  const context = {
    agendamentoService: { listar: async query => {
      requested.push(query.page ?? 1);
      return { data: [{ id_agendamento: query.page ?? 1 }], pagination: { pages: 2 } };
    } },
    favoritoService: { listar: async () => ({ data: [] }) },
    apresentarHistorico: item => item, apresentarPerfil: item => item, getErrorMessage: error => error.message,
  };
  for (const name of ['Loading', 'Historico', 'Favoritos', 'ErroHistorico', 'ErroFavoritos']) context['set' + name] = value => { state[name] = value; };
  compile(source.slice(start, end), context);
  await context.carregarDados();
  assert.deepEqual(requested, [1, 2]);
  assert.deepEqual(Array.from(state.Historico, item => item.id_agendamento), [1, 2]);
  assert.equal(state.Loading, false);
});
test('card conserva ID exclusivo do agendamento nos pagamentos e no check-in', () => {
  const start = source.indexOf('  function renderHistoryCard('), end = source.indexOf('  return (\n    <SafeAreaView', start);
  const calls = [];
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) },
    View: 'View', Text: 'Text', Image: 'Image', TouchableOpacity: 'Button', Ionicons: 'Icon',
    styles: {}, statusColors: { Aceito: '#008A99' }, statusLabels: { Aceito: 'Aceito' }, statusIcons: { Aceito: 'checkmark' },
    fotosComErro: [], abrirPerfil() {}, alternarFavorito() {},
    navigation: { push: (...args) => calls.push(args), navigate: (...args) => calls.push(args) },
  };
  compile(source.slice(start, end), context);
  const tree = context.renderHistoryCard({ ...items[0], data: '01 de novembro de 2026', checkinSolicitado: true });
  const nodes = node => typeof node === 'object' && node ? [node, ...node.children.flat(Infinity).flatMap(nodes)] : [];
  const buttons = nodes(tree).filter(node => node.type === 'Button');
  assert.equal(buttons.length, 3, 'histórico tem apenas perfil, pagamento e check-in, sem favoritar');
  assert.equal(nodes(tree).some(node => node.type === 'Icon' && ['heart', 'heart-outline'].includes(node.props.name)), false);
  buttons[1].props.onPress();
  buttons[2].props.onPress();
  assert.equal(calls[0][0], 'Pagamento');
  assert.equal(calls[0][1].agendamentoId, 40);
  assert.equal(calls[1][0], 'CheckIn');
  assert.equal(calls[1][1].agendamentoId, 40);
});


test('paginação exibe dez diárias, sem repetição, respeitando primeira e última página', () => {
  const records = Array.from({ length: 23 }, (_, i) => ({ id: i + 1 }));
  assert.deepEqual(ids(paginateHistory(records, 1).data), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(ids(paginateHistory(records, 2).data), [11,12,13,14,15,16,17,18,19,20]);
  assert.deepEqual(ids(paginateHistory(records, 3).data), [21,22,23]);
  assert.equal(paginateHistory(records, 999).page, 3);
  assert.equal(paginateHistory(records, -1).page, 1);
  assert.equal(paginateHistory(records, 1).pages, 3);
  assert.equal(records.length, 23);
  assert.equal(paginateHistory([], 2).data.length, 0);
  assert.equal(paginateHistory([], 2).page, 1);
  assert.equal(paginateHistory(Array(10).fill({ id: 1 }), 1).pages, 1);
});
test('filtra toda a lista antes de paginar; alterações de busca, status, data ou ordem voltam à página 1', () => {
  const records = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, nome: i < 20 ? 'Rafael' : 'Nicole', status: 'Aceito', dataISO: '2026-11-01' }));
  const filtered = filterHistory(records, 'Nicole', 'Aceito', '01/11', 'recentes');
  assert.deepEqual(ids(paginateHistory(filtered, 1).data), [23,22,21]);
  const start = source.indexOf('  const chavePagina =');
  const end = source.indexOf('  function mudarPagina', start);
  function pageFor(changes) {
    const context = {
      busca: '', statusFiltro: 'Todos', dataFiltro: '', ordem: 'recentes',
      paginaBusca: { chave: JSON.stringify(['', 'Todos', '', 'recentes']), pagina: 2 },
      historicoFiltrado: records, paginateHistory, useEffect() {}, ...changes,
    };
    compile(source.slice(start, end) + '\n globalThis.pageResult = paginaHistorico;', context);
    return context.pageResult.page;
  }
  assert.equal(pageFor({}), 2);
  for (const change of [{ busca: 'Nicole' }, { statusFiltro: 'Aceito' }, { dataFiltro: '01' }, { ordem: 'antigos' }]) assert.equal(pageFor(change), 1);
});
