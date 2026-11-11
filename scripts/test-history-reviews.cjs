const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function harness(reviews) {
  let cursor = 0, response = reviews, focus;
  const slots = [], effects = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous[i])) { slots[index] = deps; effects.push(fn); }
    },
  };
  const navigation = { addListener: (event, callback) => { focus = callback; return () => {}; }, goBack: () => {}, navigate: () => {} };
  const native = Object.fromEntries(['ActivityIndicator', 'ScrollView', 'Text', 'TouchableOpacity', 'View'].map(name => [name, name]));
  const imports = {
    react, 'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../services/agendamentoService': { agendamentoService: { listar: async () => ({ data: [
      { id_agendamento: 1, data_agendamento: '2099-01-12', status: 'Concluido', cliente: { usuario: { nome: 'Cliente de teste' } }, avaliacao: response },
      { id_agendamento: 2, data_agendamento: '2099-01-13', status: 'Concluido', avaliacao: [{ autor_tipo: 'Diarista', nota: 5, comentario: 'Não exibir como avaliação recebida' }] },
    ] }) } },
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
    render,
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
