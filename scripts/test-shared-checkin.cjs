const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), ts = require(path.join(root, 'node_modules/typescript'));
function harness(role, { paid = true, arrived = false, timeout = false, early = false, running = false, desktop = false, finished = false } = {}) {
  let now = Date.parse('2026-11-14T11:05:00Z'), cursor = 0;
  class Clock extends Date { static now() { return now; } }
  const slots = [], effects = [], calls = [];
  let booking = { id_agendamento: 44, status: 'Aceito', data_agendamento: '2026-11-14', horario_inicio: early ? '15:00' : '08:00',
    confirmacao_cliente_expirada: timeout, confirmacao_cliente_limite_em: timeout ? '2026-11-14T11:04:00Z' : '2026-11-14T11:35:00Z',
    cliente: { usuario: { nome: 'Cliente' } }, diarista: { usuario: { nome: 'Diarista' } },
    checkin_checkout: arrived ? [{ horario_chegada: '2026-11-14T11:04:00Z', horario_checkin: null, status_checkin: 'Checkin_solicitado' }] : [] };
  if (running) booking = { ...booking, status: 'Em_andamento', checkin_checkout: [{ horario_chegada: '2026-11-14T11:00:00Z', horario_checkin: '2026-11-14T11:01:00Z', status_checkin: 'Iniciado' }] };
  if (finished) booking = { ...booking, status: 'Concluido', checkin_checkout: [{ horario_chegada: '2026-11-14T11:00:00Z', horario_checkin: '2026-11-14T11:01:00Z', horario_checkout: '2026-11-14T11:04:00Z', status_checkin: 'Finalizado' }] };
  const payment = { id_agendamento: 44, parcelas: [{ fase: 'Entrada', status: paid ? 'Pago' : 'Pendente', pode_pagar: !timeout && !paid, valor: 50 }, { fase: 'Saldo', status: 'Pendente', pode_pagar: false, valor: 50 }] };
  const react = {
    createElement: (type, props, ...children) => typeof type === 'function' ? type(props) : ({ type, props: props ?? {}, children }),
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(fn, deps) { const index = cursor++, previous = slots[index]; if (!previous || deps.some((value, i) => value !== previous[i])) { slots[index] = deps; effects.push(fn); } },
  };
  const navigation = { addListener: () => () => {}, isFocused: () => true, navigate: (...args) => calls.push(['navigate', ...args]), goBack() {} };
  const native = { ...Object.fromEntries(['ActivityIndicator','ScrollView','Text','TouchableOpacity','View'].map(key => [key, key])), AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } };
  const imports = {
    '../../contexts/ResponsiveContext': { useResponsive: () => ({ desktop: desktop }) },
    react, 'react-native': native, 'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' }, '@expo/vector-icons': { Ionicons: 'Icon' },
    './styles': { styles: new Proxy({}, { get: (_, key) => key }) }, '../PagamentoScreen/paymentStyles': { paymentStyles: {} },
    '../../components/page-header': require('./page-header-fixture.cjs'),
    '../../components/action-modal': { ActionModal: 'ActionModal' },
    '../../services/api': { getErrorMessage: error => error.message, ApiError: class extends Error {} },
    '../../services/agendamentoService': { agendamentoService: { buscarPorId: async () => booking } },
    '../../services/pagamentoService': { pagamentoService: { buscar: async () => payment } },
    '../../services/checkinCheckoutService': { checkinCheckoutService: {
      solicitar: async id => { calls.push(['arrival', id]); await Promise.resolve(); booking = { ...booking, checkin_checkout: [{ horario_chegada: '2026-11-14T11:05:00Z', status_checkin: 'Checkin_solicitado' }] }; },
      confirmarInicio: async id => { calls.push(['confirm', id]); await Promise.resolve(); booking = { ...booking, status: 'Em_andamento', checkin_checkout: [{ ...booking.checkin_checkout[0], horario_checkin: '2026-11-14T11:05:00Z', status_checkin: 'Iniciado' }] }; },
      checkout: async id => calls.push(['checkout', id]),
    } },
  };
  const exports = {}, file = role === 'CLIENTE' ? 'CheckInScreen' : 'CheckInDiaristaScreen';
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/screens', file, 'index.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText,
    { exports, Date: Clock, setInterval: () => 1, clearInterval() {}, require: name => { if (!(name in imports)) throw Error(name); return imports[name]; } });
  let nodes;
  const walk = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(walk)];
  function render() { cursor = 0; nodes = walk(exports.default({ navigation, route: { params: { agendamentoId: 44 } } })); while (effects.length) effects.shift()(); return nodes; }
  async function ready() { render(); await new Promise(resolve => setImmediate(resolve)); return render(); }
  const textButton = label => nodes.find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes(label)));
  const modal = title => nodes.find(node => node.type === 'ActionModal' && node.props.title === title);
  return { render, ready, calls, textButton, modal, get nodes() { return nodes; } };
}
test('diarista registra Cheguei, mantém espera de confirmação e não pode fazer checkout', async () => {
  const h = harness('DIARISTA', { paid: false });
  await h.ready();
  assert.ok(h.textButton('Cheguei'));
  h.textButton('Cheguei').props.onPress(); h.render();
  const modal = h.modal('Registrar chegada?');
  assert.equal(modal.props.visible, true);
  const pending = modal.props.onConfirm(); await modal.props.onConfirm(); await pending;
  h.render();
  assert.equal(h.calls.filter(call => call[0] === 'arrival').length, 1);
  assert.equal(h.textButton('Realizar checkout'), undefined);
  assert.ok(h.nodes.some(node => node.type === 'Text' && node.children.includes('Aguardando confirmação')));
});
test('cliente confirma chegada pela modal, sem cobrança, com bloqueio de clique repetido', async () => {
  const h = harness('CLIENTE', { arrived: true });
  await h.ready();
  h.textButton('Confirmar chegada e iniciar').props.onPress(); h.render();
  const modal = h.modal('A diarista está no local?');
  assert.equal(modal.props.visible, true);
  const pending = modal.props.onConfirm(); await modal.props.onConfirm(); await pending;
  h.render();
  assert.equal(h.calls.filter(call => call[0] === 'confirm').length, 1);
  assert.equal(h.calls[0][1], 44);
  assert.ok(h.modal('Diária iniciada').props.visible);
});
test('cliente não inicia sem chegada ou sem entrada paga; ausência de confirmação tem texto próprio', async () => {
  for (const options of [{ arrived: false }, { arrived: true, paid: false }, { arrived: true, timeout: true }]) {
    const h = harness('CLIENTE', options);
    await h.ready();
    assert.equal(h.textButton('Confirmar chegada e iniciar'), undefined);
    assert.equal(h.calls.length, 0);
    if (options.timeout) assert.ok(h.nodes.some(node => node.type === 'Text' && node.children.join('').includes('falta de confirmação do cliente')));
    if (options.paid === false) assert.ok(h.textButton('Pagar entrada'));
  }
});

test('mobile mostra orientações curtas, prazo destacado e pagamentos em cards',async()=>{
 const h=harness('DIARISTA',{early:true,paid:false});await h.ready();
 const texts=h.nodes.filter(n=>n.type==='Text').map(n=>n.children.flat(Infinity).join(''));
 assert.ok(texts.includes('Antes de iniciar'));
 assert.ok(texts.some(t=>t.includes('A entrada precisa estar paga')));
 assert.ok(texts.includes('Registrar chegada até'));
 assert.ok(h.nodes.some(n=>n.props.style==='deadlineCard'));
 assert.ok(h.nodes.some(n=>n.props.style==='paymentGrid'));
 assert.equal(h.nodes.filter(n=>n.props.style==='paymentCard').length,2);
 assert.equal(h.calls.length,0,'renderizar blocos não registra chegada nem pagamentos');
});
test('espera destaca confirmação e serviço em andamento separa registros e checkout',async()=>{
 const waiting=harness('DIARISTA',{arrived:true});await waiting.ready();
 const texts=waiting.nodes.filter(n=>n.type==='Text').map(n=>n.children.flat(Infinity).join(''));
 assert.ok(texts.includes('Aguarde o cliente'));
 assert.ok(texts.includes('Confirmação até'));
 assert.ok(texts.includes('Registros da diária'));
 assert.equal(waiting.textButton('Realizar checkout'),undefined);
 const running=harness('DIARISTA',{running:true});await running.ready();
 assert.ok(running.nodes.some(n=>n.props.style==='recordsCard'));
 assert.equal(running.nodes.filter(n=>n.props.style==='recordRow').length,2);
 assert.ok(running.textButton('Realizar checkout'));
});


test('Cheguei e confirmação do cliente ficam disponíveis antes do horário agendado', async () => {
  const worker = harness('DIARISTA', {early:true});
  await worker.ready();
  assert.equal(worker.textButton('Cheguei').props.disabled, false);
  worker.textButton('Cheguei').props.onPress();worker.render();
  await worker.modal('Registrar chegada?').props.onConfirm();
  assert.equal(worker.calls.filter(call=>call[0]==='arrival').length,1);
  const client = harness('CLIENTE', {early:true,arrived:true});
  await client.ready();
  assert.ok(client.textButton('Confirmar chegada e iniciar'));
  client.textButton('Confirmar chegada e iniciar').props.onPress();client.render();
  await client.modal('A diarista está no local?').props.onConfirm();
  assert.equal(client.calls.filter(call=>call[0]==='confirm').length,1);
});

test('checkout bem-sucedido abre avaliação do cliente para a diária correta', async () => {
  const h = harness('DIARISTA', { running: true });
  await h.ready();
  h.textButton('Realizar checkout').props.onPress();h.render();
  await h.modal('Finalizar diária?').props.onConfirm();
  assert.equal(h.calls.filter(call => call[0] === 'checkout').length, 1);
  const navigation = h.calls.find(call => call[0] === 'navigate' && call[1] === 'Avaliacao');
  assert.ok(navigation);
  assert.equal(navigation[2].agendamentoId, 44);
  assert.equal(navigation[2].avaliarCliente, true);
});

test('web organiza chegada, espera, serviço e finalização nas mesmas colunas sem perder ações',async()=>{
 for(const options of [{early:true},{arrived:true},{running:true},{finished:true}]){
 const h=harness('DIARISTA',{...options,desktop:true});await h.ready();
 assert.ok(h.nodes.some(n=>n.props.style==='desktopColumns'));
 assert.ok(h.nodes.some(n=>n.props.style==='desktopOverview'));
 assert.ok(h.nodes.some(n=>n.props.style==='desktopActivity'));
 assert.equal(h.nodes.filter(n=>n.props.accessibilityLabel==='Atualizar diária e pagamentos').length,1);
 if(options.early)assert.ok(h.textButton('Cheguei'));
 if(options.arrived)assert.equal(h.textButton('Cheguei'),undefined);
 if(options.running)assert.ok(h.textButton('Realizar checkout'));
 if(options.finished)assert.ok(h.textButton('Avaliar cliente'));
 }
});
