const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const source = screen => fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
function extract(text, name) {
  const start = text.indexOf('  function ' + name + '(');
  assert.notEqual(start, -1);
  let index = text.indexOf('{', start), depth = 1;
  for (index++; depth > 0; index++) {
    if (text[index] === '{') depth++;
    else if (text[index] === '}') depth--;
  }
  return text.slice(start, index);
}
function compile(code, context = {}) {
  vm.createContext(context);
  vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, module: ts.ModuleKind.None } }).outputText, context);
  return context;
}

test('busca e favoritos usam apenas o booleano calculado pela API, não texto de cadastro', () => {
  for (const [screen, name] of [['EncontrarDiaristaScreen', 'apresentarDiarista'], ['HistoricoClienteScreen', 'apresentarPerfil']]) {
    const context = compile(extract(source(screen), name));
    for (const value of [true, false, undefined]) {
      const profile = { id_diarista: 8, frequencia_resposta: 'Responde rápido', responde_rapido: value };
      const result = screen.startsWith('Encontrar') ? context[name](profile, []) : context[name](profile);
      assert.equal(result.respostaRapida, value === true);
    }
  }
});

test('selo é condicional e query só usa o filtro aplicado, não o rascunho', () => {
  const find = source('EncontrarDiaristaScreen');
  assert.ok(find.includes('{diarista.respostaRapida && <View style={styles.quickResponse}>'));
  assert.ok(find.includes('responde_rapido: respostaRapidaAplicada ? true : undefined'));
  assert.equal(find.includes('Boolean(profile.frequencia_resposta)'), false);
  assert.ok(source('HistoricoClienteScreen').includes('diarista.respostaRapida && <View style={styles.favoriteQuick}>'));
});

test('selecionar ou limpar não aplica filtro sem confirmação; reabrir descarta rascunho', () => {
  const text = source('EncontrarDiaristaScreen');
  const state = { filtroAberto: '', respostaRapidaAplicada: false, somenteRespostaRapida: false };
  state.setFiltroAberto = value => { state.filtroAberto = value; };
  state.setRespostaRapidaAplicada = value => { state.respostaRapidaAplicada = value; };
  state.setSomenteRespostaRapida = value => { state.somenteRespostaRapida = value; };
  compile(['alternarFiltro', 'aplicarFiltro', 'limparRascunhoFiltro'].map(name => extract(text, name)).join('\n'), state);
  state.alternarFiltro('Responde rápido');
  state.somenteRespostaRapida = true;
  assert.equal(state.respostaRapidaAplicada, false);
  state.aplicarFiltro();
  assert.equal(state.respostaRapidaAplicada, true);
  assert.equal(state.filtroAberto, '');
  state.alternarFiltro('Responde rápido');
  state.limparRascunhoFiltro();
  assert.equal(state.somenteRespostaRapida, false);
  assert.equal(state.respostaRapidaAplicada, true);
  state.alternarFiltro('Responde rápido');
  state.alternarFiltro('Responde rápido');
  assert.equal(state.somenteRespostaRapida, true);
  state.limparRascunhoFiltro();
  state.aplicarFiltro();
  assert.equal(state.respostaRapidaAplicada, false);
});


function serviceHarness() {
  const helper = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/utils/serviceFilterDraft.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: helper });
  const state = {
    filtroAberto: '', servicoDigitado: '', servicoAplicado: '', servicosSelecionados: [], servicoEmEdicao: null, erroServico: '',
    updateServiceDraft: helper.updateServiceDraft,
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    View: 'View', Text: 'Text', TextInput: 'TextInput', TouchableOpacity: 'TouchableOpacity', Ionicons: 'Icon', styles: {},
    renderAcoesFiltro: () => null,
  };
  for (const field of ['FiltroAberto', 'ServicoDigitado', 'ServicoAplicado', 'ServicosSelecionados', 'ServicoEmEdicao', 'ErroServico']) {
    const name = field[0].toLowerCase() + field.slice(1);
    state['set' + field] = value => { state[name] = typeof value === 'function' ? value(state[name]) : value; };
  }
  compile(['alternarFiltro', 'aplicarFiltro', 'limparRascunhoFiltro', 'adicionarServico', 'renderFiltroServicos'].map(name => extract(source('EncontrarDiaristaScreen'), name)).join('\n'), state);
  return state;
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
}

test('serviços são adicionados, editados e removidos como etiquetas antes de aplicar', () => {
  const state = serviceHarness();
  state.alternarFiltro('Serviços realizados');
  state.servicoDigitado = 'janelas';
  state.adicionarServico();
  state.servicoDigitado = 'passar pano';
  state.adicionarServico();
  assert.deepEqual(Array.from(state.servicosSelecionados), ['janelas', 'passar pano']);
  assert.equal(state.servicoAplicado, '');
  let tree = state.renderFiltroServicos();
  nodes(tree).find(node => node.props?.accessibilityLabel === 'Editar serviço janelas').props.onPress();
  assert.equal(state.servicoDigitado, 'janelas');
  state.servicoDigitado = 'limpeza de janelas';
  state.adicionarServico();
  tree = state.renderFiltroServicos();
  nodes(tree).find(node => node.props?.accessibilityLabel === 'Remover serviço passar pano').props.onPress();
  assert.deepEqual(Array.from(state.servicosSelecionados), ['limpeza de janelas']);
  assert.equal(state.servicoAplicado, '');
  state.aplicarFiltro();
  assert.equal(state.servicoAplicado, 'limpeza de janelas');
  assert.equal(state.filtroAberto, '');
});

test('limpar e descartar alterações não modificam a busca até confirmar', () => {
  const state = serviceHarness();
  state.servicoAplicado = 'janelas, passar pano';
  state.alternarFiltro('Serviços realizados');
  assert.deepEqual(Array.from(state.servicosSelecionados), ['janelas', 'passar pano']);
  state.limparRascunhoFiltro();
  assert.equal(state.servicosSelecionados.length, 0);
  assert.equal(state.servicoAplicado, 'janelas, passar pano');
  state.alternarFiltro('Serviços realizados');
  state.alternarFiltro('Serviços realizados');
  assert.deepEqual(Array.from(state.servicosSelecionados), ['janelas', 'passar pano']);
  state.limparRascunhoFiltro();
  state.aplicarFiltro();
  assert.equal(state.servicoAplicado, '');
});

test('não adiciona vazio, duplicado ou mais de 10 serviços e não perde texto ao aplicar', () => {
  const state = serviceHarness();
  state.alternarFiltro('Serviços realizados');
  state.adicionarServico();
  assert.match(state.erroServico, /Digite/);
  state.servicoDigitado = 'janelas';
  state.adicionarServico();
  state.servicoDigitado = 'JANELAS';
  state.adicionarServico();
  assert.match(state.erroServico, /já foi adicionado/);
  assert.equal(state.servicosSelecionados.length, 1);
  state.servicosSelecionados = Array.from({ length: 10 }, (_, index) => 'serviço ' + index);
  state.servicoDigitado = 'outro';
  state.adicionarServico();
  assert.equal(state.servicosSelecionados.length, 10);
  assert.match(state.erroServico, /no máximo 10/);
  state.servicosSelecionados = ['janelas'];
  state.servicoDigitado = 'passar pano';
  state.aplicarFiltro();
  assert.equal(state.servicoAplicado, 'janelas, passar pano');
});
