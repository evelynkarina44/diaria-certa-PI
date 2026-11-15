const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('../node_modules/typescript');
const root = path.resolve(__dirname, '..');
function compile(file, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText, { exports, require: n => { if (!(n in imports)) throw Error(n); return imports[n]; } });
  return exports;
}
const policy = compile('src/utils/responsiveLayout.ts');
const menu = compile('src/utils/navigationMenu.ts');
test('layout muda somente na web a partir de 1024px; nativo e tablet mantêm navegação móvel', () => {
  for (const platform of ['ios', 'android']) assert.equal(policy.responsiveLayout(platform, 1600, 'HistoricoCliente', true).desktop, false);
  for (const width of [320,390,768,1023]) assert.equal(policy.responsiveLayout('web', width, 'HistoricoCliente', true).sidebar, false);
  assert.equal(policy.responsiveLayout('web', 1024, 'HistoricoCliente', true).sidebar, true);
});
test('formulários têm largura limitada; colunas dependem do espaço restante após menu', () => {
  assert.equal(policy.responsiveLayout('web', 1440, 'Login', false).maxWidth, 1280);
  assert.equal(policy.responsiveLayout('web', 1440, 'Pagamento', true).maxWidth, 860);
  assert.equal(policy.responsiveLayout('web', 1024, 'FavoritosCliente', true).columns, 1);
  assert.equal(policy.responsiveLayout('web', 1440, 'FavoritosCliente', true).columns, 2);
  assert.ok(policy.responsiveLayout('web', 1920, 'EncontrarDiarista', true).contentWidth <= 1280);
});
test('rotas públicas não exibem menu de conta, mesmo durante troca/cadastro de perfil', () => {
  for (const route of ['Home','Login','Cadastro','CadastroCliente','CadastroDiarista','SelecionarPerfil']) {
    assert.equal(policy.responsiveLayout('web', 1440, route, true).sidebar, false);
  }
  assert.equal(policy.responsiveLayout('web', 1440, 'HistoricoCliente', false).sidebar, false);
});
test('menu usa as mesmas rotas no desktop e celular, preserva ordem e separação por perfil', () => {
  assert.deepEqual(Array.from(menu.profileMenu('cliente').slice(0,2), i => i.route), ['PerfilCliente','EncontrarDiarista']);
  assert.deepEqual(Array.from(menu.profileMenu('diarista').slice(0,2), i => i.route), ['PerfilDiaristaEdicao','HomeDiarista']);
  assert.equal(menu.profileMenu('cliente').some(i => i.route === 'ServicosDiarista'), false);
  assert.equal(menu.profileAccess(true,false).route, 'CadastroDiarista');
  assert.equal(menu.profileAccess(true,true).route, 'SelecionarPerfil');
});
const element = (type, props, ...children) => ({ type, props: props ?? {}, children });
const walk = n => !n || typeof n !== 'object' ? [] : [n, ...(n.children ?? []).flat(Infinity).flatMap(walk)];
test('redimensionar o shell mantém o mesmo conteúdo montado e não duplica ações de negócio', () => {
  let width = 1440;
  const calls = [], child = { type: 'BookingScreen', props: {}, children: [] };
  const user = { activeProfile: 'DIARISTA', nome: 'Teste', email: 'teste@example.test', cliente: [{}], diarista: [{}] };
  const { ResponsiveShell } = compile('src/components/responsive-shell/index.web.tsx', {
    react: { createElement: element, useState: initial => [initial, () => {}] },
    'react-native': { View:'View', Text:'Text', Pressable:'Pressable', ScrollView:'ScrollView', Image:'Image', StyleSheet:{ create:v=>v }, useWindowDimensions:()=>({ width }) },
    '@expo/vector-icons': { Ionicons:'Icon' },
    '../../contexts/GlobalContext': { useAuth:()=>({user}) },
    '../../assets/logo (2).png':'official-logo',
    '../../contexts/ResponsiveContext': { ResponsiveContext:{Provider:'ResponsiveProvider'} },
    '../../utils/responsiveLayout':policy, '../../utils/navigationMenu':menu, '../logout-button':{ LogoutButton:'LogoutButton' },
  });
  const props = { children:child, routeName:'ServicosDiarista', navigation:{navigate:r=>calls.push(r)} };
  let tree = ResponsiveShell(props), nodes = walk(tree);
  assert.ok(nodes.some(n=>n.props.accessibilityLabel==='Navegação principal'));
  assert.ok(nodes.some(n=>n===child));
  assert.ok(nodes.some(n=>n.type==='Image'&&n.props.source==='official-logo'));
  assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('CONEXAO QUE FACILITA SEU DIA A DIA')));
  nodes.find(n=>n.props.accessibilityState?.selected===true).props.onPress();
  assert.deepEqual(calls, ['ServicosDiarista']);
  width=390; tree=ResponsiveShell(props);
  assert.equal(walk(tree).some(n=>n.props.accessibilityLabel==='Navegação principal'),false);
  assert.ok(walk(tree).some(n=>n===child));
  assert.equal(tree.props.value.desktop,false);
});
test('grade mantém uma coluna no celular e duas somente quando há espaço', () => {
  let columns=1;
  const { ResponsiveGrid } = compile('src/components/responsive-grid/index.tsx', {
    react: { createElement:element, Children:{toArray:c=>c}, isValidElement:c=>Boolean(c?.type) },
    'react-native': {View:'View',StyleSheet:{create:v=>v}},
    '../../contexts/ResponsiveContext': {useResponsive:()=>({columns})},
  });
  const cards=[element('Card',{key:'1'}),element('Card',{key:'2'})];
  let tree=ResponsiveGrid({children:cards});
  assert.equal(tree.children[0],cards);
  columns=2; tree=ResponsiveGrid({children:cards});
  assert.equal(tree.children[0][0].props.style.width,'48.8%');
  assert.equal(ResponsiveGrid({children:cards,singleColumn:true}).children[0],cards);
});

test('tablet limita formulários sem ativar menu desktop nem alterar a abertura móvel', () => {
  for (const width of [768, 820, 1023]) {
    const form = policy.responsiveLayout('web', width, 'CadastroCliente', false);
    assert.equal(form.constrained, true);
    assert.equal(form.sidebar, false);
    assert.ok(form.contentWidth <= 760);
    assert.equal(policy.responsiveLayout('web', width, 'Home', false).constrained, false);
  }
  assert.equal(policy.responsiveLayout('web', 390, 'Login', false).constrained, false);
  assert.equal(policy.responsiveLayout('android', 820, 'Login', false).constrained, false);
});

test('menu móvel mantém opções roláveis e saída acessível em telas baixas', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/header-menu/index.tsx'), 'utf8');
  assert.match(source, /<ScrollView style={styles.items}/);
  assert.ok(source.indexOf('</ScrollView>') < source.indexOf('<View style={styles.footer}>'));
  const { styles } = compile('src/components/header-menu/styles.ts', {
    'react-native': {StyleSheet:{create:v=>v, absoluteFill:{}}},
    '../../global': {colors:{}, fonts:{}, fontSizes:{}},
  });
  assert.equal(styles.items.minHeight, 0);
  assert.equal(styles.footer.flexShrink, 0);
});

test('lista de diaristas mantém espaçamento dentro da grade em uma coluna', () => {
  const source = fs.readFileSync(path.join(root, 'src/screens/EncontrarDiaristaScreen/index.tsx'), 'utf8');
  assert.match(source, /<ResponsiveGrid style={styles.list}>/);
});
