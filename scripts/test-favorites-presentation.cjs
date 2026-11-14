const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function harness(initial = favoriteRecords) {
  let favorites = [...initial]; const removed = [];
  let cursor = 0, focus;
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
    '../../components/header-menu': { HeaderMenu: 'HeaderMenu' },
    '../../components/page-header': require('./page-header-fixture.cjs'),
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../services/favoritoService': { favoritoService: {
      listar: async () => ({ data: favorites }),
      remover: async id => { removed.push(id); favorites = favorites.filter(item => item.id_favorito !== id); },
    } },
    '../../services/agendamentoService': { agendamentoService: { listar: async (query) => {
      requests.push(query);
      const data = [];
      const page = query.page ?? 1;
      return { data: data.slice((page - 1) * 100, page * 100), pagination: { pages: Math.ceil(data.length / 100) } };
    } } },
    '../../services/api': { getErrorMessage: error => error.message },
    './styles': { styles: {} },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(root, 'src/screens/HistoricoClienteScreen/index.tsx'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, {
    exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; },
  });
  const render = () => {
    cursor = 0;
    const tree = exports.default({ navigation, route: { name: 'FavoritosCliente' } });
    while (effects.length) effects.shift()();
    return tree;
  };
  return {
    render, requests, navigations, removed,
    async ready() { render(); await new Promise(resolve => setImmediate(resolve)); return render(); },
    async refresh(reviews) { focus(); await new Promise(resolve => setImmediate(resolve)); return render(); },
  };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
}
const texts = tree => nodes(tree).filter(node => node.type === 'Text').map(node => node.props.children.flat(Infinity).join(''));
const review = (nota, comentario) => ({ id_avaliacao: 1, autor_tipo: 'Cliente', nota, comentario, anonima: false });


const favoriteRecords = [
  { id_favorito: 101, id_diarista: 11, diarista: { id_diarista: 11, usuario: { nome: 'Nicole Lima', foto_perfil: 'https://example.test/nicole.jpg' }, avaliacao_media: 0, avaliacao: [], responde_rapido: false, endereco: [{ bairro: 'Jardim Europa', cidade: 'Jandira', estado: 'SP' }] } },
  { id_favorito: 202, id_diarista: 22, diarista: { id_diarista: 22, usuario: { nome: 'Rafael Sá' }, avaliacao_media: 5, avaliacao: [{ nota: 5 }], responde_rapido: true, endereco: [{ bairro: 'Terras do Madeira', cidade: 'Carapicuíba', estado: 'SP' }] } },
];

test('favoritas mostram foto, avaliação, localização, selo real e acesso ao perfil correto', async () => {
  const h = harness(); let tree = await h.ready();
  const labels = texts(tree);
  assert.ok(labels.includes('Nicole Lima'));
  assert.ok(labels.includes('Sem avaliações'));
  assert.ok(labels.includes('Rafael Sá'));
  assert.equal(labels.filter(t => t === 'Responde rápido').length, 1);
  assert.equal(labels.filter(t => t === 'Ver perfil').length, 2);
  assert.ok(nodes(tree).some(n => n.type === 'Image' && n.props.source.uri.endsWith('nicole.jpg')));
  nodes(tree).find(n => n.props.accessibilityLabel === 'Abrir perfil de Rafael Sá').props.onPress();
  assert.equal(h.navigations[0][0], 'PerfilDiarista');
  assert.equal(h.navigations[0][1].diaristaId, 22);
});
test('busca por nome e localização ignora acentos, pode limpar e mostra nenhum resultado', async () => {
  const h = harness(); let tree = await h.ready();
  const search = value => {
    nodes(tree).find(n => n.props.accessibilityLabel === 'Buscar favoritas').props.onChangeText(value);
    tree = h.render();
  };
  search('rafael sa');
  assert.ok(texts(tree).includes('Rafael Sá'));
  assert.equal(texts(tree).includes('Nicole Lima'), false);
  search('CARAPICUIBA'); assert.ok(texts(tree).includes('Rafael Sá'));
  search('inexistente'); assert.ok(texts(tree).includes('Nenhuma profissional encontrada'));
  nodes(tree).find(n => n.props.accessibilityLabel === 'Limpar busca de favoritas').props.onPress(); tree = h.render();
  assert.ok(texts(tree).includes('Nicole Lima'));
});
test('remover usa o ID do favorito e não confunde com o ID da diarista', async () => {
  const h = harness(); let tree = await h.ready();
  await nodes(tree).find(n => n.props.accessibilityLabel === 'Remover Nicole Lima dos favoritos').props.onPress();
  tree = h.render();
  assert.deepEqual(h.removed, [101]);
  assert.equal(texts(tree).includes('Nicole Lima'), false);
  assert.ok(texts(tree).includes('Rafael Sá'));
});
test('sem favoritas oferece atalho para encontrar profissionais', async () => {
  const h = harness([]); const tree = await h.ready();
  assert.ok(texts(tree).includes('Suas favoritas ficam aqui'));
  nodes(tree).find(n => n.type === 'TouchableOpacity' && n.props.children.some(c => c?.type === 'Text' && c.props.children.includes('Encontrar diaristas'))).props.onPress();
  assert.equal(h.navigations[0][0], 'EncontrarDiarista');
});
