import type { TrackingAppointment, TrackingProfile } from '../services/trackingService';

export type TrackingState = {
  title: string; description: string; step: number; priority: number;
  requiresAction: boolean; actionLabel: string; route?: 'Pagamento' | 'CheckIn' | 'CheckInDiarista' | 'Avaliacao';
  respond?: boolean; finished?: boolean;
};
export function trackingState(item: TrackingAppointment, profile: TrackingProfile, now = Date.now()): TrackingState {
  const customer = profile === 'CLIENTE';
  const payment = item.pagamento;
  const entryPaid = payment?.parcelas.some(p => p.fase === 'Entrada' && p.status === 'Pago');
  const details = customer ? 'Pagamento' as const : 'CheckInDiarista' as const;
  const state = (title: string, description: string, step: number, priority: number, extra: Partial<TrackingState> = {}): TrackingState => ({
    title, description, step, priority, requiresAction: false, actionLabel: 'Ver detalhes', route: details, ...extra,
  });
  const arrived = Boolean(item.checkin?.horario_chegada);
  const confirmationLimit = item.confirmacao_cliente_limite_em ?? (item.checkin?.horario_chegada ? new Date(new Date(item.checkin.horario_chegada).getTime() + 30 * 60000).toISOString() : null);
  const confirmationExpired = item.confirmacao_cliente_expirada || (item.status === 'Aceito' && arrived && !item.checkin?.horario_checkin && Boolean(confirmationLimit) && now >= new Date(confirmationLimit!).getTime());
  if (confirmationExpired) return state('Confirmação do cliente expirada', 'A chegada foi registrada, mas o cliente não confirmou em 30 minutos. A diária foi encerrada; a entrada paga terá estorno integral.', -1, 8, { finished: true, actionLabel: 'Ver detalhes e estorno' });
  const late = item.status === 'Aceito' && !arrived && !item.checkin?.horario_checkin && item.inicio_em && now >= new Date(item.inicio_em).getTime() + 30 * 60000;
  if (item.checkin_expirado || late) {
    return state('Check-in expirado', 'A chegada não foi registrada nos 30 minutos após o horário marcado. Se a entrada foi paga, será solicitado o estorno integral. Acompanhe os detalhes e o histórico.', -1, 8, { finished: true, actionLabel: 'Ver detalhes e estorno' });
  }
  if (payment?.parcelas.some(p => p.estorno_pendente || p.status === 'Estorno_pendente')) {
    return state('Estorno em processamento', 'A devolução está sendo processada. O prazo depende do Mercado Pago.', -1, 2);
  }
  if (payment?.parcelas.some(p => p.status === 'Em_disputa')) {
    return state('Pagamento em análise', 'Há uma análise do pagamento. Consulte os detalhes antes de continuar.', -1, 2);
  }
  if (['Recusado', 'Cancelado', 'Expirado'].includes(item.status)) {
    const title = item.status === 'Recusado' ? 'Solicitação recusada' : item.status === 'Cancelado' ? 'Agendamento cancelado' : 'Solicitação expirada';
    return state(title, payment?.parcelas.some(p => p.status === 'Estornado') ? 'O pagamento foi estornado.' : 'Esta solicitação foi encerrada. Você pode consultar o registro no histórico.', -1, 8, { route: undefined, actionLabel: '', finished: true });
  }
  if (item.status === 'Pendente') {
    return state(customer ? 'Aguardando aceite' : 'Nova solicitação', customer ? 'A diarista precisa aceitar ou recusar. Nenhum pagamento é solicitado antes do aceite.' : 'Confira a data e os serviços e responda à solicitação.', 1, customer ? 4 : 0,
      customer ? { actionLabel: 'Ver solicitação' } : { actionLabel: '', route: undefined, respond: true, requiresAction: true });
  }
  if (item.status === 'Em_andamento') {
    return state('Diária em andamento', customer ? 'O início foi confirmado. O saldo será liberado depois do checkout.' : 'Ao terminar o serviço, confirme o checkout para liberar o saldo para o cliente pagar.', 3, 0,
      { requiresAction: !customer, actionLabel: customer ? 'Ver pagamento' : 'Realizar checkout' });
  }
  if (item.status === 'Concluido') {
    if (payment?.quitado && customer && payment.pode_avaliar) return state('Falta sua avaliação', 'Pagamento integral confirmado. Conte como foi o serviço da diarista.', 5, 1, { requiresAction: true, actionLabel: 'Avaliar diarista', route: 'Avaliacao' });
    if (payment?.quitado) return state('Diária concluída e quitada', customer ? 'Serviço finalizado, pagamento confirmado e avaliação registrada.' : 'Serviço finalizado e as duas parcelas aprovadas. Os valores são recebidos pela plataforma.', 6, 7, { finished: true, actionLabel: 'Ver detalhes e pagamentos' });
    const canPay = payment?.parcelas.some(p => p.fase === 'Saldo' && p.pode_pagar);
    return state('Aguardando pagamento do saldo', customer ? 'A diarista finalizou o serviço. Pague os 50% restantes para concluir o fluxo.' : 'Checkout registrado. Aguarde o cliente pagar os 50% restantes.', 4, customer ? 1 : 3, { requiresAction: customer && Boolean(canPay), actionLabel: customer && canPay ? 'Pagar saldo de 50%' : 'Ver pagamento da diária' });
  }
  if (item.status === 'Aceito' && arrived && !item.checkin?.horario_checkin) {
    if (customer && !entryPaid) return state('A diarista chegou', 'Pague a entrada e confirme o início pelo aplicativo em até 30 minutos após a chegada.', 2, 0,
      { requiresAction: Boolean(payment?.parcelas.some(p => p.fase === 'Entrada' && p.pode_pagar)), actionLabel: 'Pagar entrada e confirmar' });
    return state(customer ? 'Confirme a chegada' : 'Aguardando confirmação do cliente',
      customer ? 'A diarista registrou a chegada. Confirme que ela está no endereço para iniciar o serviço. Prazo de 30 minutos.'
        : 'Chegada registrada. Aguarde o cliente confirmar antes de começar o serviço.', 3, customer ? 0 : 2,
      { requiresAction: customer, actionLabel: customer ? 'Confirmar início' : 'Ver confirmação', route: customer ? 'CheckIn' : 'CheckInDiarista' });
  }
  if (!customer && item.status === 'Aceito' && item.inicio_em && new Date(item.inicio_em).getTime() <= now) {
    return state('Registre sua chegada', 'Ao chegar ao endereço, toque em Cheguei e aguarde o cliente confirmar o início pelo aplicativo.', 3, 0,
      { requiresAction: true, actionLabel: 'Cheguei', route: 'CheckInDiarista' });
  }
  if (!payment) return state('Aguardando dados do pagamento', 'Abra os detalhes da diária para conferir as informações disponíveis.', 2, 3);
  if (!entryPaid) {
    const canPay = payment.parcelas.some(p => p.fase === 'Entrada' && p.pode_pagar);
    return state('Entrada de 50% pendente', customer ? 'A solicitação foi aceita. Pague a entrada antes do início do serviço.' : 'Você aceitou a solicitação. Aguarde a aprovação da entrada paga pelo cliente.', 2, customer ? 1 : 4,
      { requiresAction: customer && canPay, actionLabel: customer && canPay ? 'Pagar entrada de 50%' : 'Ver detalhes da diária' });
  }
  const canStart = Boolean(item.inicio_em) && new Date(item.inicio_em!).getTime() <= now;
  return state(canStart ? 'Horário do check-in' : 'Diária confirmada', customer ? 'Entrada aprovada. Aguarde a diarista registrar a chegada e confirme o início no horário combinado.' : canStart ? 'O horário agendado chegou e a entrada está paga. Você já pode registrar a chegada.' : 'Entrada aprovada. O check-in será liberado no horário agendado.', 3, canStart ? 1 : 5,
    { requiresAction: !customer && canStart, actionLabel: !customer && canStart ? 'Cheguei' : 'Ver detalhes da diária' });
}
