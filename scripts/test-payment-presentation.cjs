const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require(path.join(__dirname, '../node_modules/typescript'));
const source = fs.readFileSync(path.join(__dirname, '../src/screens/PagamentoScreen/index.tsx'), 'utf8').replace(/\r\n/g, '\n');
const helpers = source.slice(source.indexOf('const money ='), source.indexOf('// O navegador'));
function compile(code, context = {}) {
  vm.createContext(context);
  vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, module: ts.ModuleKind.None } }).outputText, context);
  return context;
}
const base = (overrides = {}) => ({
  id_agendamento: 40, status_agendamento: 'Aceito', valor_total: 120,
  quitado: false, pode_avaliar: false, parcelas: [
    { fase: 'Entrada', valor: 60, status: 'Pendente', pode_pagar: true, estorno_pendente: false },
    { fase: 'Saldo', valor: 60, status: 'Pendente', pode_pagar: false, estorno_pendente: false },
  ], ...overrides,
});
test('rótulos curtos distinguem liberação, aprovação, falha, análise e estorno', () => {
  const h = compile(helpers), summary = base();
  assert.equal(h.installmentLabel(summary.parcelas[0], summary), 'Aguardando pagamento');
  assert.equal(h.installmentLabel(summary.parcelas[1], summary), 'Libera após o checkout');
  assert.equal(h.installmentLabel({ ...summary.parcelas[0], pode_pagar: false }, summary), 'Libera após o aceite');
  for (const [status, label] of [['Pago','Pago'], ['Falhou','Não aprovado'], ['Em_disputa','Em análise'], ['Estornado','Estornado']]) {
    assert.equal(h.installmentLabel({ ...summary.parcelas[0], status }, summary), label);
  }
  assert.equal(h.installmentLabel({ ...summary.parcelas[0], status: 'Pago', estorno_pendente: true }, summary), 'Estorno em processamento');
});
test('encerramento impede orientação enganosa de pagar, sem esconder pagamentos realizados', () => {
  const h = compile(helpers);
  for (const status_agendamento of ['Cancelado','Recusado','Expirado']) {
    const summary = base({ status_agendamento });
    assert.equal(h.installmentLabel(summary.parcelas[1], summary), 'Sem cobrança');
    assert.equal(h.installmentLabel({ ...summary.parcelas[0], status: 'Pago' }, summary), 'Pago');
  }
});
test('aviso de expiração distingue estorno em processamento de estorno efetivamente confirmado', () => {
  const h = compile(helpers), summary = base({ checkin_expirado: true });
  assert.equal(h.paymentNotice(summary), 'Sem check-in em 30 min. Diária encerrada.');
  summary.parcelas[0].status = 'Pago';
  assert.match(h.paymentNotice(summary), /sujeito à confirmação/);
  assert.equal(h.paymentNotice(summary).includes('devolvida'), false);
  summary.parcelas[0].status = 'Estorno_pendente';
  assert.match(h.paymentNotice(summary), /Estorno integral em processamento pelo Mercado Pago/);
  summary.parcelas[0].status = 'Estornado';
  assert.match(h.paymentNotice(summary), /Entrada devolvida integralmente/);
});
function screen(summary) {
  let index = 0;
  const updates = {};
  const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) },
    ...Object.fromEntries(['SafeAreaView','View','Text','ScrollView','TouchableOpacity','Ionicons','ActionModal','ActivityIndicator'].map(name => [name, name])),
    PageHeader: 'PageHeader', styles: {}, useAuth: () => ({ user: { id_usuario: 1, activeProfile: 'CLIENTE' } }),
    useRef: initial => ({ current: initial }), useEffect() {},
    useState(initial) { const slot = index++; return [slot === 0 ? summary : initial, value => { updates[slot] = value; }]; },
  };
  compile(helpers + source.slice(source.indexOf('function PagamentoDoAgendamento(')), context);
  const tree = context.PagamentoDoAgendamento({ navigation: { goBack() {}, navigate() {} }, route: { params: { agendamentoId: 40, dataAgendamento: '10 de novembro de 2026' } } });
  const walk = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(walk)];
  const nodes = walk(tree);
  const texts = nodes.filter(node => node.type === 'Text').map(node => node.children.flat(Infinity).join(''));
  return { nodes, texts, updates };
}
test('tela mostra valores e contexto, sem repetir estorno nem pedir saldo em diária expirada', () => {
  const summary = base({ checkin_expirado: true, status_agendamento: 'Expirado' });
  Object.assign(summary.parcelas[0], { status: 'Estorno_pendente', estorno_pendente: true, pode_pagar: false });
  const { texts } = screen(summary);
  assert.ok(texts.includes('Check-in expirado'));
  assert.ok(texts.includes('DIÁRIA #40'));
  assert.ok(texts.includes('10 de novembro de 2026'));
  assert.ok(texts.includes('Entrada · 50%'));
  assert.ok(texts.includes('Saldo · 50%'));
  assert.ok(texts.includes('Sem cobrança'));
  assert.equal(texts.filter(text => text.includes('Estorno integral em processamento pelo Mercado Pago')).length, 1);
  assert.equal(texts.some(text => text.includes('Aguardando pagamento')), false);
});
test('pagamento, sincronização, cancelamento e ajuda continuam acessíveis; detalhes ficam na modal', () => {
  const { nodes, texts, updates } = screen(base());
  assert.ok(texts.includes('Pagar entrada'));
  assert.equal(texts.includes('Pagar saldo'), false);
  assert.equal(texts.includes('Atualizar pagamento'), false);
  assert.ok(nodes.some(node => node.props.accessibilityLabel === 'Atualizar pagamento'));
  assert.ok(texts.includes('Cancelar agendamento'));
  assert.ok(texts.includes('Pagamento seguro pelo Mercado Pago'));
  const info = nodes.find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes('Como funciona')));
  info.props.onPress();
  assert.match(updates[4], /Não há cobrança ao solicitar/);
  assert.match(updates[4], /Pix e cartões/);
  assert.match(updates[4], /Não informe dados de cartão/);
});
test('não renderiza parcelas de outra diária', () => {
  const { texts } = screen(base({ id_agendamento: 99 }));
  assert.equal(texts.some(text => text.includes('DIÁRIA #99') || text.includes('Entrada · 50%')), false);
});

