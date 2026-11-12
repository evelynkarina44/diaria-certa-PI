import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';
import { ActivityIndicator, AppState, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const expired = booking?.checkin_expirado || (booking?.status === 'Aceito' && !check?.horario_checkin && Number.isFinite(deadline) && now >= deadline);
  const canStart = !expired && booking?.status === 'Aceito' && entryPaid && Number.isFinite(startsAt) && now >= startsAt;
  const canFinish = running && check?.status_checkin === 'Iniciado';
  const canCancel = !expired && booking?.status === 'Aceito' && !check?.horario_checkin;

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
        : 'Check-in registrado. A diária está em andamento.');
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
      <View style={[styles.orangeHeader, { justifyContent: 'center', paddingHorizontal: 18 }]}>
        <TouchableOpacity accessibilityLabel="Voltar" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{expired ? 'Check-in expirado' : booking?.status === 'Cancelado' ? 'Diária cancelada' : finished ? 'Diária finalizada' : running ? 'Diária em andamento' : 'Check-in da diária'}</Text>
        <View style={styles.divider} />
        {loading && <ActivityIndicator color="#FF6B2C" />}
        {booking && <>
          <Text style={styles.name}>{booking.cliente?.usuario?.nome ?? 'Cliente'}</Text>
          <Text style={styles.address}>Agendamento #{id} • {new Date(booking.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {time(booking.horario_inicio)}</Text>
          <Text style={styles.sectionTitle}>Endereço</Text>
          <Text style={styles.address}>{booking.endereco ? booking.endereco.logradouro + ', ' + booking.endereco.numero + ' — ' + booking.endereco.bairro : 'Endereço não informado'}</Text>
          <Text style={styles.sectionTitle}>Serviços solicitados</Text>
          {booking.agendamento_servico?.map(item => <Text key={item.id} style={styles.address}>• {item.diarista_servico?.servico?.nome_servico ?? 'Serviço'}</Text>)}
          {!expired && booking.status === 'Aceito' && <Text style={[styles.address, { marginTop: 24 }]}>
            {!entryPaid ? 'Aguardando o cliente pagar a entrada de 50% para iniciar a diária.' : !canStart ? 'O check-in será liberado a partir do horário agendado. Horário de Brasília.' : 'O horário chegou. Registre o check-in para iniciar a diária.'}
          </Text>}
          {expired && <Text style={[styles.address, { marginTop: 24, color: '#D92D20' }]}>O check-in não foi registrado nos 30 minutos após o horário agendado. Esta diária foi encerrada. Se a entrada foi paga, será solicitado o estorno integral ao cliente. Consulte o histórico para acompanhar.</Text>}
          {!expired && booking.status === 'Aceito' && Number.isFinite(deadline) && <Text style={[styles.address, { marginTop: 12 }]}>Prazo para check-in: {stamp(new Date(deadline).toISOString())}. Tolerância de 30 minutos.</Text>}
          {running && <Text style={[styles.address, { marginTop: 24 }]}>Ao terminar o serviço, realize o checkout para liberar o pagamento do saldo pelo cliente.</Text>}
          {check?.horario_checkin && <Text style={[styles.address, { marginTop: 16 }]}>Check-in: {stamp(check.horario_checkin)}</Text>}
          {check?.horario_checkout && <Text style={[styles.address, { marginTop: 10 }]}>Checkout: {stamp(check.horario_checkout)}</Text>}
          {finished && <Text style={[styles.address, { marginTop: 16 }]}>O checkout liberou os 50% restantes para o cliente pagar. Finalizar o serviço não confirma o pagamento.</Text>}
          {!expired && (booking.status === 'Aceito' || running) && <TouchableOpacity
            accessibilityRole="button"
            style={[styles.checkInButton, (loading || sending || sessionExpired || !(canStart || canFinish)) && { opacity: 0.45 }]}
            disabled={loading || sending || sessionExpired || !(canStart || canFinish)}
            onPress={() => void act()}>
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkInButtonText}>
              {canFinish ? 'Realizar checkout' : 'Realizar check-in'}
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
        </TouchableOpacity> : <TouchableOpacity disabled={sending} onPress={() => void reload.current()}><Text style={[styles.address, { color: '#008A99', marginTop: 24 }]}>Atualizar diária e pagamentos</Text></TouchableOpacity>}
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
        title={confirmCheckout ? 'Finalizar diária?' : 'Iniciar diária?'}
        message={confirmCheckout ? 'Confirma que terminou o serviço? O checkout registra a finalização e libera os 50% restantes para o cliente pagar.' : 'Confirma que está iniciando o serviço? O horário do check-in será registrado agora.'}
        confirmLabel={confirmCheckout ? 'Confirmar checkout' : 'Confirmar check-in'} cancelLabel="Cancelar" busy={sending}
        onConfirm={act} onClose={() => { setConfirmCheckout(false); setConfirmStart(false); }} />
    </SafeAreaView>
  );
}
