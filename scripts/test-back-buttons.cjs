const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { PageHeader } = require('./page-header-fixture.cjs');
const root = path.resolve(__dirname, '..');
const walk = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(walk)];
test('cabeçalho mantém voltar à esquerda e ações à direita, com título único', () => {
  let backs = 0;
  const tree = PageHeader({ title: 'Minhas diárias', onBack: () => backs++, right: { type: 'Bell', props: {}, children: [] } });
  const nodes = walk(tree);
  const back = nodes.find(node => node.props.accessibilityLabel === 'Voltar');
  back.props.onPress();
  assert.equal(backs, 1);
  assert.equal(tree.children[0].children[0], back);
  assert.ok(nodes.find(node => node.type === 'Bell'));
  assert.equal(nodes.filter(node => node.type === 'Text' && node.children.includes('Minhas diárias')).length, 1);
  assert.equal(back.props.style({ pressed: false })[0].width, 44);
});
test('perfis, históricos, agendamento e avaliação usam o cabeçalho compartilhado', () => {
  for (const name of ['PerfilCliente', 'PerfilDiaristaEdicao', 'PerfilDiarista', 'HistoricoCliente', 'HistoricoDiarista', 'AgendarDiaria', 'Avaliacao']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', name + 'Screen/index.tsx'), 'utf8');
    assert.match(source, /<PageHeader/);
    if (name === 'HistoricoDiarista' || name === 'HistoricoCliente') {
      assert.match(source, /left=\{<HeaderMenu/);
      assert.match(source, /Consulte suas diárias, pagamentos e avaliações/);
      assert.doesNotMatch(source, /onBack=/);
    } else assert.match(source, /onBack=/);
  }
});
test('cabeçalho adapta altura ao texto, preserva menu e cores de cada perfil', () => {
  const menu = { type: 'Menu', props: {}, children: [] };
  const tree = PageHeader({ title: 'Meus serviços', subtitle: 'Gerencie seus serviços e preços.', accentColor: '#FF6B2C', left: menu });
  assert.equal(tree.props.style.find(style => style?.backgroundColor).backgroundColor, '#FF6B2C');
  assert.equal(tree.props.style[0].height, undefined);
  assert.equal(tree.children[0].children[0], menu);
  const title = walk(tree).find(node => node.props.accessibilityRole === 'header');
  assert.equal(title.props.style[0].fontSize, 24);
  assert.equal(title.props.numberOfLines, undefined);
  assert.equal(walk(tree).filter(node => node.props.accessibilityLabel === 'Voltar').length, 0);
});
test('telas autenticadas usam o padrão e Minhas diárias não duplica título', () => {
  for (const name of ['ServicosDiarista', 'CombosDiarista', 'AgendaDiarista', 'HomeDiarista', 'SolicitacoesDiarista', 'EncontrarDiarista', 'Pagamento', 'CheckIn', 'CheckInDiarista', 'Chatbot', 'HistoricoDiarista']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', name + 'Screen/index.tsx'), 'utf8');
    assert.match(source, /<PageHeader/);
  }
  const screen = fs.readFileSync(path.join(root, 'src/screens/HistoricoDiaristaScreen/index.tsx'), 'utf8');
  assert.ok(screen.includes('title="Minhas diárias"'));
});

test('perfis de edição não exibem título, mas preservam a navegação de voltar', () => {
  for (const name of ['PerfilCliente', 'PerfilDiaristaEdicao']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', name + 'Screen/index.tsx'), 'utf8');
    const header = source.match(/<PageHeader[\s\S]*?\/>/)[0];
    assert.doesNotMatch(header, /title=/);
    assert.match(header, /onBack=/);
  }
  const tree = PageHeader({ onBack() {} });
  assert.equal(walk(tree).filter(node => node.props.accessibilityRole === 'header').length, 0);
  assert.ok(walk(tree).some(node => node.props.accessibilityLabel === 'Voltar'));
});

test('Minhas diárias reutiliza os históricos com menu e descrição, sem tela duplicada', () => {
  for(const name of ['HistoricoClienteScreen','HistoricoDiaristaScreen']){
    const screen = fs.readFileSync(path.join(root,'src/screens',name,'index.tsx'),'utf8');
    assert.match(screen, /left=\{<HeaderMenu/);
    assert.ok(screen.includes('Minhas diárias'));
    assert.ok(screen.includes('Consulte suas diárias, pagamentos e avaliações.'));
    assert.doesNotMatch(screen, /onBack=/);
  }
  assert.equal(fs.existsSync(path.join(root,'src/screens/AcompanharDiariasScreen/index.tsx')),false);
});
