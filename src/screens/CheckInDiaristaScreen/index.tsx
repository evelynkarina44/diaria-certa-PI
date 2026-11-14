import { PageHeader } from '../../components/page-header';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';
import { ActivityIndicator, AppState, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { agendamentoService } from '../../services/agendamentoService';
import { checkinCheckoutService } from '../../services/checkinCheckoutService';
import { pagamentoService, type ResumoPagamento } from '../../services/pagamentoService';
import { ApiError, getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const time = (value?: string | null) => value?.includes('T') ? value.slice(11, 16) : value?.slice(0, 5) ?? '';
const stamp = (value?: string | null) => value ? new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '';

export default function CheckInDiaristaScreen(props: any) {
  return <Diaria key={props.route.params?.agendamentoId} {...props} />;
}

function Diaria({ navigation, route }: any) {
  const id = Number(route.params?.agendamentoId);
  const [booking, setBooking] = useState<Agendamento | null>(null);
  const [payment, setPayment] = useState<ResumoPagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const invalidSession = useRef(false);
  const [now, setNow] = useState(Date.now());
  const locked = useRef(false);
  const alive = useRef(true);
  const reload = useRef<() => Promise<void>>(async () => {});

  function showError(cause: unknown) {
    if (cause instanceof ApiError && cause.status === 401) {
      invalidSession.current = true;
      setSessionExpired(true);
      setConfirmCheckout(false); setConfirmStart(false); setConfirmCancel(false);
      setError('Sua sessão expirou. Entre novamente no perfil de diarista e abra esta diária para confirmar o checkout.');
    } else setError(getErrorMessage(cause));
  }

  useEffect(() => {
    alive.current = true;
    let active = true;
    let fetching = false;
    async function load(silent = false) {
      if (!active || fetching || locked.current || invalidSession.current) return;
      if (!Number.isSafeInteger(id) || id <= 0) {
        setError('Abra esta tela a partir de um agendamento.'); setLoading(false); return;
      }
      fetching = true;
      try {
        const [appointment, summary] = await Promise.all([
          agendamentoService.buscarPorId(id), pagamentoService.buscar(id),
        ]);
        if (active) { setBooking(appointment); setPayment(summary); if (!silent) setError(''); }
      } catch (cause) {
        if (active && (!silent || (cause instanceof ApiError && cause.status === 401))) showError(cause);
      } finally { fetching = false; if (active) setLoading(false); }
    }
    reload.current = load;
    void load();
    const unsubscribe = navigation.addListener('focus', () => void load());
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && navigation.isFocused()) void load();
    });
    const timer = setInterval(() => {
      setNow(Date.now());
      if (navigation.isFocused() && AppState.currentState === 'active') void load(true);
    }, 15000);
    return () => {
      active = false; alive.current = false;
      unsubscribe(); subscription.remove(); clearInterval(timer);
    };
  }, [id, navigation]);

  const check = booking?.checkin_checkout?.[0];
  const running = booking?.status === 'Em_andamento';
  const finished = booking?.status === 'Concluido';
  const entryPaid = payment?.parcelas.some(item => item.fase === 'Entrada' && item.status === 'Pago') ?? false;
  const startsAt = booking?.horario_inicio
    ? new Date(booking.data_agendamento.slice(0, 10) + 'T' + time(booking.horario_inicio) + ':00-03:00').getTime()
    : NaN;
  const deadline = booking?.checkin_limite_em ? new Date(booking.checkin_limite_em).getTime() : startsAt + 30 * 60000;
  const arrived = Boolean(check?.horario_chegada);
  const confirmationLimit = booking?.confirmacao_cliente_limite_em ? new Date(booking.confirmacao_cliente_limite_em).getTime()
    : check?.horario_chegada ? new Date(check.horario_chegada).getTime() + 30 * 60000 : NaN;
  const confirmationExpired = booking?.confirmacao_cliente_expirada || (booking?.status === 'Aceito' && arrived && !check?.horario_checkin && now >= confirmationLimit);
  const waiting = booking?.status === 'Aceito' && arrived && !check?.horario_checkin && !confirmationExpired;
  const expired = booking?.checkin_expirado || (booking?.status === 'Aceito' && !arrived && !check?.horario_checkin && Number.isFinite(deadline) && now >= deadline);
  const canStart = !expired && !confirmationExpired && !arrived && booking?.status === 'Aceito' && Number.isFinite(startsAt) && now >= startsAt;
  const canFinish = running && check?.status_checkin === 'Iniciado';
  const canCancel = !expired && !confirmationExpired && booking?.status === 'Aceito' && !check?.horario_checkin;

  async function act() {
    if (locked.current || invalidSession.current || !(canStart || canFinish)) return;
    if (canFinish && !confirmCheckout) { setConfirmCheckout(true); return; }
    if (canStart && !confirmStart) { setConfirmStart(true); return; }
    locked.current = true; setSending(true); setError(''); setNotice('');
    let updated = false;
    try {
      if (canFinish) await checkinCheckoutService.checkout(id);
      else await checkinCheckoutService.solicitar(id);
      updated = true;
      if (!alive.current) return;
      setNotice(canFinish
        ? 'Checkout registrado. O cliente já pode pagar os 50% restantes. O valor ainda depende da aprovação do Mercado Pago.'
        : 'Chegada registrada. O cliente será avisado no aplicativo e deverá confirmar o início em até 30 minutos. Aguarde a confirmação antes de começar.');
      setConfirmCheckout(false); setConfirmStart(false);
    } catch (cause) {
      setConfirmCheckout(false); setConfirmStart(false);
      if (alive.current) showError(cause);
    } finally {
      locked.current = false;
      if (alive.current) { setSending(false); if (updated) await reload.current(); }
    }
  }

  async function cancelBooking() {
    if (locked.current || invalidSession.current || !canCancel) return;
    locked.current = true; setSending(true); setError(''); setNotice('');
    let updated = false;
    try {
      const canceled = await agendamentoService.cancelar(id, 'Cancelamento solicitado pela diarista antes do check-in.');
      updated = true;
      if (!alive.current) return;
      setBooking(canceled);
      setNotice('Diária cancelada. Se houver pagamento aprovado, será solicitado o estorno integral ao cliente. A devolução não é imediata e depende do Mercado Pago.');
    } catch (cause) {
      if (alive.current) showError(cause);
    } finally {
      locked.current = false;
      if (alive.current) {
        setConfirmCancel(false); setSending(false);
        if (updated) await reload.current();
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title={confirmationExpired ? 'Confirmação não recebida' : waiting ? 'Aguardando confirmação' : expired ? 'Check-in expirado' : booking?.status === 'Cancelado' ? 'Diária cancelada' : finished ? 'Diária finalizada' : running ? 'Diária em andamento' : 'Registrar chegada'} accentColor="#FF6B2C" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading && <ActivityIndicator color="#FF6B2C" />}
        {booking && <>
          <Text style={styles.name}>{booking.cliente?.usuario?.nome ?? 'Cliente'}</Text>
          <Text style={styles.address}>Agendamento #{id} • {new Date(booking.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {time(booking.horario_inicio)}</Text>
          <Text style={styles.sectionTitle}>Endereço</Text>
          <Text style={styles.address}>{booking.endereco ? booking.endereco.logradouro + ', ' + booking.endereco.numero + ' — ' + booking.endereco.bairro : 'Endereço não informado'}</Text>
          <Text style={styles.sectionTitle}>Serviços solicitados</Text>
          {booking.agendamento_servico?.map(item => <Text key={item.id} style={styles.address}>• {item.diarista_servico?.servico?.nome_servico ?? 'Serviço'}</Text>)}
          {!expired && !confirmationExpired && !waiting && booking.status === 'Aceito' && <Text style={[styles.address, { marginTop: 24 }]}>
            {!canStart ? 'Registre a chegada a partir do horário agendado, no horário de Brasília.' : 'Ao chegar ao local, toque em Cheguei. O cliente precisa confirmar antes do início.'}
            {!entryPaid ? ' A entrada ainda precisa ser paga pelo cliente para que o serviço possa começar.' : ''}
          </Text>}
          {waiting && <Text style={[styles.address, { marginTop: 24 }]}>Chegada registrada. Aguarde o cliente confirmar o início no aplicativo até {stamp(new Date(confirmationLimit).toISOString())}. Não comece o serviço antes da confirmação.</Text>}
          {confirmationExpired && <Text style={[styles.address, { marginTop: 24, color: '#D92D20' }]}>Você registrou a chegada, mas o cliente não confirmou em 30 minutos. A diária foi encerrada por falta de confirmação, sem registrar sua ausência. A entrada paga terá estorno integral.</Text>}
          {expired && <Text style={[styles.address, { marginTop: 24, color: '#D92D20' }]}>A chegada não foi registrada nos 30 minutos após o horário agendado. Esta diária foi encerrada. Se a entrada foi paga, será solicitado o estorno integral ao cliente. Consulte o histórico para acompanhar.</Text>}
          {!expired && !confirmationExpired && !waiting && booking.status === 'Aceito' && Number.isFinite(deadline) && <Text style={[styles.address, { marginTop: 12 }]}>Prazo para registrar chegada: {stamp(new Date(deadline).toISOString())}. Tolerância de 30 minutos.</Text>}
          {running && <Text style={[styles.address, { marginTop: 24 }]}>Ao terminar o serviço, realize o checkout para liberar o pagamento do saldo pelo cliente.</Text>}
          {check?.horario_chegada && <Text style={[styles.address, { marginTop: 16 }]}>Chegada: {stamp(check.horario_chegada)}</Text>}
          {check?.horario_checkin && <Text style={[styles.address, { marginTop: 16 }]}>Check-in: {stamp(check.horario_checkin)}</Text>}
          {check?.horario_checkout && <Text style={[styles.address, { marginTop: 10 }]}>Checkout: {stamp(check.horario_checkout)}</Text>}
          {finished && <Text style={[styles.address, { marginTop: 16 }]}>O checkout liberou os 50% restantes para o cliente pagar. Finalizar o serviço não confirma o pagamento.</Text>}
          {!expired && !confirmationExpired && !waiting && (booking.status === 'Aceito' || running) && <TouchableOpacity
            accessibilityRole="button"
            style={[styles.checkInButton, (loading || sending || sessionExpired || !(canStart || canFinish)) && { opacity: 0.45 }]}
            disabled={loading || sending || sessionExpired || !(canStart || canFinish)}
            onPress={() => void act()}>
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkInButtonText}>
              {canFinish ? 'Realizar checkout' : 'Cheguei'}
            </Text>}
          </TouchableOpacity>}
        </>}
        {canCancel && <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cancelar diária"
          disabled={loading || sending || sessionExpired}
          style={{ borderWidth: 1, borderColor: '#D92D20', borderRadius: 12, padding: 14, marginTop: 20, alignItems: 'center', opacity: loading || sending || sessionExpired ? 0.45 : 1 }}
          onPress={() => setConfirmCancel(true)}>
          <Text style={{ color: '#D92D20', fontFamily: 'Poppins_600SemiBold' }}>Cancelar diária</Text>
        </TouchableOpacity>}
        {payment?.parcelas.map(item => <Text key={item.fase} style={[styles.address, { marginTop: 16 }]}>{item.fase}: {money(item.valor)} — {item.status.replace(/_/g, ' ')}</Text>)}
        {sessionExpired ? <TouchableOpacity style={styles.checkInButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          <Text style={styles.checkInButtonText}>Entrar novamente</Text>
        </TouchableOpacity> : <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar diária e pagamentos" accessibilityState={{ disabled: sending || loading, busy: loading }} disabled={sending || loading} style={[{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: '#FFF1E8' }, { marginTop: 24 }]} onPress={() => void reload.current()}>{loading ? <ActivityIndicator size="small" color="#C2410C" /> : <Ionicons name="refresh-outline" size={22} color="#C2410C" />}</TouchableOpacity>}
      </ScrollView>
      <ActionModal visible={Boolean(error)} variant="error" title={sessionExpired ? 'Sessão expirada' : 'Não foi possível concluir'} message={error}
        confirmLabel={sessionExpired ? 'Entrar novamente' : 'Entendi'} onClose={() => setError('')}
        onConfirm={() => { setError(''); if (sessionExpired) navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} />
      <ActionModal visible={!error && Boolean(notice)} variant="success" title={booking?.status === 'Cancelado' ? 'Diária cancelada' : 'Registro realizado'} message={notice} onClose={() => setNotice('')} accentColor="#FF6B2C" />
      <ActionModal visible={confirmCancel && !error && !notice} variant="confirm" accentColor="#D92D20"
        title="Cancelar diária aceita?"
        message="Confirma o cancelamento desta diária? O cliente será informado no aplicativo. Se houver pagamento aprovado, será solicitado o estorno integral; a devolução não é imediata."
        confirmLabel="Sim, cancelar diária" cancelLabel="Manter diária" busy={sending}
        onConfirm={cancelBooking} onClose={() => setConfirmCancel(false)} />
      <ActionModal visible={(confirmStart || confirmCheckout) && !error && !notice} variant="confirm" accentColor="#FF6B2C"
        title={confirmCheckout ? 'Finalizar diária?' : 'Registrar chegada?'}
        message={confirmCheckout ? 'Confirma que terminou o serviço? O checkout registra a finalização e libera os 50% restantes para o cliente pagar.' : 'Confirme apenas se já chegou ao endereço. Isso não inicia o serviço: aguarde a confirmação do cliente no aplicativo.'}
        confirmLabel={confirmCheckout ? 'Confirmar checkout' : 'Confirmar chegada'} cancelLabel="Cancelar" busy={sending}
        onConfirm={act} onClose={() => { setConfirmCheckout(false); setConfirmStart(false); }} />
    </SafeAreaView>
  );
}
