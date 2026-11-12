const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const output = {};
const source = fs.readFileSync(path.join(root, 'src/utils/appointmentTracking.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: output, require: () => { throw Error('Policy must not access API'); } });
const { trackingState } = output;
const now = new Date('2026-11-10T11:00:00Z').getTime();
function item(status = 'Aceito') {
 return { id_agendamento: 40, status, inicio_em: '2026-11-10T11:00:00Z', data_agendamento: '2026-11-10T00:00:00Z',
  pagamento: { quitado: false, pode_avaliar: false, parcelas: [
   { fase: 'Entrada', status: 'Pendente', pode_pagar: true },
   { fase: 'Saldo', status: 'Pendente', pode_pagar: false },
  ] } };
}
test('pending request: only diarista receives accept/refuse actions', () => {
 const data = item('Pendente');
 assert.equal(trackingState(data, 'DIARISTA', now).respond, true);
 assert.equal(trackingState(data, 'DIARISTA', now).requiresAction, true);
 assert.equal(trackingState(data, 'CLIENTE', now).respond, undefined);
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, false);
});
test('accepted unpaid entry: only client receives payment action', () => {
 const data = item();
 assert.equal(trackingState(data, 'CLIENTE', now).actionLabel, 'Pagar entrada de 50%');
 assert.equal(trackingState(data, 'CLIENTE', now).route, 'Pagamento');
 assert.equal(trackingState(data, 'DIARISTA', now).requiresAction, false);
});
test('check-in is offered to diarista only after paid entry and scheduled start', () => {
 const data = item();
 data.pagamento.parcelas[0].status = 'Pago';
 assert.equal(trackingState(data, 'DIARISTA', now - 1).requiresAction, false);
 assert.equal(trackingState(data, 'DIARISTA', now).actionLabel, 'Realizar check-in');
 assert.equal(trackingState(data, 'DIARISTA', now).route, 'CheckInDiarista');
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, false);
});
test('in progress: only diarista receives checkout; no balance payment or review', () => {
 const data = item('Em_andamento');
 assert.equal(trackingState(data, 'DIARISTA', now).actionLabel, 'Realizar checkout');
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, false);
 assert.equal(trackingState(data, 'CLIENTE', now).step, 3);
});
test('checkout enables balance payment to client, not automatic approval or worker payout', () => {
 const data = item('Concluido');
 data.pagamento.parcelas[0].status = 'Pago';
 data.pagamento.parcelas[1].pode_pagar = true;
 assert.equal(trackingState(data, 'CLIENTE', now).actionLabel, 'Pagar saldo de 50%');
 assert.equal(trackingState(data, 'DIARISTA', now).requiresAction, false);
 assert.equal(trackingState(data, 'DIARISTA', now).finished, undefined);
});
test('full payment enables client review; existing review closes the flow', () => {
 const data = item('Concluido');
 data.pagamento.quitado = true; data.pagamento.pode_avaliar = true;
 assert.equal(trackingState(data, 'CLIENTE', now).route, 'Avaliacao');
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, true);
 assert.equal(trackingState(data, 'DIARISTA', now).finished, true);
 data.pagamento.pode_avaliar = false;
 assert.equal(trackingState(data, 'CLIENTE', now).finished, true);
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, false);
});
test('refunds, disputes and refusals do not offer payment, check-in or accept actions', () => {
 const data = item('Cancelado');
 data.pagamento.parcelas[0].status = 'Estorno_pendente';
 assert.equal(trackingState(data, 'CLIENTE', now).step, -1);
 assert.equal(trackingState(data, 'CLIENTE', now).requiresAction, false);
 data.pagamento.parcelas[0].status = 'Em_disputa';
 assert.equal(trackingState(data, 'DIARISTA', now).requiresAction, false);
 data.status = 'Recusado'; data.pagamento.parcelas[0].status = 'Pendente';
 assert.equal(trackingState(data, 'CLIENTE', now).route, undefined);
 assert.equal(trackingState(data, 'DIARISTA', now).respond, undefined);
});
test('same professional on two dates keeps independent stages and actions', () => {
 const unpaid = item(); unpaid.id_agendamento = 41;
 const paid = item(); paid.pagamento.parcelas[0].status = 'Pago';
 assert.equal(trackingState(unpaid, 'CLIENTE', now).step, 2);
 assert.equal(trackingState(paid, 'CLIENTE', now).step, 3);
 assert.equal(unpaid.id_agendamento, 41);
});
test('home panels, shared menu and post-booking flows link to tracking, not history', () => {
 const client = fs.readFileSync(path.join(root, 'src/screens/EncontrarDiaristaScreen/index.tsx'), 'utf8');
 assert.equal(client.includes('<AppointmentTracker'), false);
 assert.ok(client.includes('<NotificationBell'));
 const worker = fs.readFileSync(path.join(root, 'src/screens/HomeDiaristaScreen/index.tsx'), 'utf8');
 assert.ok(worker.includes('<AppointmentTracker'));
 assert.ok(worker.includes('<NotificationBell'));
 const menu = fs.readFileSync(path.join(root, 'src/components/header-menu/index.tsx'), 'utf8');
 assert.equal(menu.split("route: 'AcompanharDiarias'").length - 1, 2);
 for (const screen of ['AgendarDiariaScreen','PagamentoScreen','AvaliacaoScreen','ChatbotScreen']) {
  const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
  assert.ok(source.includes("navigation.navigate('AcompanharDiarias')"), screen);
 }
 const tracker = fs.readFileSync(path.join(root, 'src/components/appointment-tracker/index.tsx'), 'utf8');
 assert.ok(tracker.includes('15000'));
 assert.ok(tracker.includes('clearInterval(timer)'));
 assert.equal(tracker.includes('pagamentoService.sincronizar'), false);
});

test('limite de 30min encerra pendência para ambos os perfis; não encerra diária iniciada', () => {
  for (const profile of ['CLIENTE', 'DIARISTA']) {
    const data = item();
    data.pagamento.parcelas[0].status = 'Pago';
    const before = trackingState(data, profile, now + 30 * 60000 - 1);
    assert.notEqual(before.title, 'Check-in expirado');
    const expired = trackingState(data, profile, now + 30 * 60000);
    assert.equal(expired.title, 'Check-in expirado');
    assert.equal(expired.finished, true);
    assert.equal(expired.requiresAction, false);
    data.status = 'Em_andamento';
    assert.equal(trackingState(data, profile, now + 5 * 3600000).title, 'Diária em andamento');
    data.status = 'Expirado';
    data.checkin_expirado = true;
    assert.equal(trackingState(data, profile, now).title, 'Check-in expirado');
  }
});
