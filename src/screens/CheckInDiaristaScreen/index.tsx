import { useResponsive } from '../../contexts/ResponsiveContext';
import { PageHeader } from '../../components/page-header';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';
import { ActivityIndicator, AppState, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles as baseStyles } from './styles';
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
  const { desktop } = useResponsive();
  const styles = desktop ? { ...baseStyles,
    name: [baseStyles.name, baseStyles.desktopName],
    address: [baseStyles.address, baseStyles.desktopBody],
    sectionTitle: [baseStyles.sectionTitle, baseStyles.desktopSectionTitle],
    checkInButton: [baseStyles.checkInButton, baseStyles.desktopAction],
    checkInButtonText: [baseStyles.checkInButtonText, baseStyles.desktopActionText],
  } : baseStyles;
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
  const canStart = !expired && !confirmationExpired && !arrived && booking?.status === 'Aceito' && Number.isFinite(startsAt);
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
      if (alive.current) {
        setSending(false);
        if (updated) {
          await reload.current();
          if (canFinish && alive.current) navigation.navigate('Avaliacao', { agendamentoId: id, avaliarCliente: true });
        }
      }
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


  const overview = (<>        {booking && <>
          <Text style={styles.name}>{booking.cliente?.usuario?.nome ?? 'Cliente'}</Text>
          <Text style={styles.address}>Diária #{booking.numero_diarista ?? '—'} • {new Date(booking.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {time(booking.horario_inicio)}</Text>
          {finished && !payment?.avaliacao_diarista && <TouchableOpacity
            accessibilityRole="button" style={styles.checkInButton}
            onPress={() => navigation.navigate('Avaliacao', { agendamentoId: id, avaliarCliente: true })}>
            <Text style={styles.checkInButtonText}>Avaliar cliente</Text>
          </TouchableOpacity>}
          <Text style={styles.sectionTitle}>Endereço</Text>
          <Text style={styles.address}>{booking.endereco ? booking.endereco.logradouro + ', ' + booking.endereco.numero + ' — ' + booking.endereco.bairro : 'Endereço não informado'}</Text>
          <Text style={styles.sectionTitle}>Serviços solicitados</Text>
          <View style={baseStyles.servicesList}>
            {booking.agendamento_servico?.map(item => <View key={item.id} style={baseStyles.serviceRow}>
              <Ionicons name="checkmark-outline" size={16} color="#C2410C" />
              <Text style={baseStyles.serviceName}>{item.diarista_servico?.servico?.nome_servico ?? 'Serviço'}</Text>
            </View>)}
          </View>
        </>}</>);
  const activity = (<>{booking && <>
          {!expired && !confirmationExpired && !waiting && booking.status === 'Aceito' && <>
            <StageNotice icon="location-outline" title="Antes de iniciar" steps={[
              'Toque em Cheguei ao chegar, mesmo antes do horário.',
              'Aguarde o cliente confirmar o início.',
              ...(!entryPaid ? ['A entrada precisa estar paga para começar.'] : []),
            ]} />
            {Number.isFinite(deadline) && <View style={baseStyles.deadlineCard}>
              <Ionicons name="time-outline" size={20} color="#B54708" />
              <View style={baseStyles.rowInfo}>
                <Text style={baseStyles.smallLabel}>Registrar chegada até</Text>
                <Text style={baseStyles.deadlineValue}>{stamp(new Date(deadline).toISOString())}</Text>
                <Text style={baseStyles.smallLabel}>Tolerância de 30 minutos</Text>
              </View>
            </View>}
          </>}
          {waiting && <>
            <StageNotice icon="hourglass-outline" title="Aguarde o cliente" steps={['Sua chegada foi registrada.', 'Não comece antes da confirmação.']} />
            <View style={baseStyles.deadlineCard}>
              <Ionicons name="time-outline" size={20} color="#B54708" />
              <View style={baseStyles.rowInfo}>
                <Text style={baseStyles.smallLabel}>Confirmação até</Text>
                <Text style={baseStyles.deadlineValue}>{stamp(new Date(confirmationLimit).toISOString())}</Text>
              </View>
            </View>
          </>}
          {confirmationExpired && <StageNotice icon="alert-circle-outline" tone="error" title="Confirmação não recebida" steps={[
            'O cliente não confirmou em 30 minutos.',
            'Diária encerrada, sem registrar sua ausência.',
            'A entrada paga terá estorno integral.',
          ]} />}
          {expired && <StageNotice icon="alarm-outline" tone="error" title="Prazo de chegada encerrado" steps={[
            'A chegada não foi registrada no prazo de 30 minutos.',
            'Se a entrada foi paga, será solicitado estorno integral.',
            'Acompanhe o estorno em Minhas diárias.',
          ]} />}
          {running && <StageNotice icon="sparkles-outline" title="Serviço em andamento" steps={['Ao terminar, faça o checkout para liberar o saldo ao cliente.']} />}
          {finished && <StageNotice icon="checkmark-circle-outline" title="Serviço finalizado" steps={['Saldo liberado para o cliente pagar.', 'O checkout não confirma o pagamento.']} />}
          {(check?.horario_chegada || check?.horario_checkin || check?.horario_checkout) && <View style={baseStyles.recordsCard}>
            <Text style={baseStyles.blockTitle}>Registros da diária</Text>
            {[
              { label: 'Chegada', value: check?.horario_chegada },
              { label: 'Check-in', value: check?.horario_checkin },
              { label: 'Checkout', value: check?.horario_checkout },
            ].filter(item => item.value).map(item => <View key={item.label} style={baseStyles.recordRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16803C" />
              <View style={baseStyles.rowInfo}>
                <Text style={baseStyles.recordLabel}>{item.label}</Text>
                <Text style={baseStyles.recordValue}>{stamp(item.value)}</Text>
              </View>
            </View>)}
          </View>}
          {!expired && !confirmationExpired && !waiting && (booking.status === 'Aceito' || running) && <TouchableOpacity
            accessibilityRole="button"
            style={[styles.checkInButton, (loading || sending || sessionExpired || !(canStart || canFinish)) && { opacity: 0.45 }]}
            disabled={loading || sending || sessionExpired || !(canStart || canFinish)}
            onPress={() => void act()}>
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkInButtonText}>
              {canFinish ? 'Realizar checkout' : 'Cheguei'}
            </Text>}
          </TouchableOpacity>}
</>}        {canCancel && <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cancelar diária"
          disabled={loading || sending || sessionExpired}
          style={{ borderWidth: 1, borderColor: '#D92D20', borderRadius: 12, padding: 14, marginTop: 20, alignItems: 'center', opacity: loading || sending || sessionExpired ? 0.45 : 1 }}
          onPress={() => setConfirmCancel(true)}>
          <Text style={{ color: '#D92D20', fontFamily: 'Poppins_600SemiBold' }}>Cancelar diária</Text>
        </TouchableOpacity>}
        {Boolean(payment?.parcelas.length) && <View style={baseStyles.paymentSection}>
          <Text style={baseStyles.blockTitle}>Pagamentos</Text>
          <View style={baseStyles.paymentGrid}>
            {payment?.parcelas.map(item => {
              const paid = item.status === 'Pago' && !item.estorno_pendente;
              const refunding = item.estorno_pendente || item.status === 'Estorno_pendente';
              return <View key={item.fase} style={baseStyles.paymentCard}>
                <Text style={baseStyles.smallLabel}>{item.fase}</Text>
                <Text style={baseStyles.paymentAmount}>{money(item.valor)}</Text>
                <View style={[baseStyles.paymentBadge, paid && baseStyles.paidBadge]}>
                  <Ionicons name={paid ? 'checkmark-circle-outline' : refunding ? 'return-down-back-outline' : 'time-outline'} size={15} color={paid ? '#16803C' : '#667085'} />
                  <Text style={[baseStyles.paymentStatus, paid && baseStyles.paidText]}>{refunding ? 'Estorno em processamento' : item.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>;
            })}
          </View>
        </View>}
        {sessionExpired ? <TouchableOpacity style={styles.checkInButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          <Text style={styles.checkInButtonText}>Entrar novamente</Text>
        </TouchableOpacity> : <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar diária e pagamentos" accessibilityState={{ disabled: sending || loading, busy: loading }} disabled={sending || loading} style={[{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: '#FFF1E8' }, { marginTop: 24 }]} onPress={() => void reload.current()}>{loading ? <ActivityIndicator size="small" color="#C2410C" /> : <Ionicons name="refresh-outline" size={22} color="#C2410C" />}</TouchableOpacity>}
</>);
  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title={confirmationExpired ? 'Confirmação não recebida' : waiting ? 'Aguardando confirmação' : expired ? 'Check-in expirado' : booking?.status === 'Cancelado' ? 'Diária cancelada' : finished ? 'Diária finalizada' : running ? 'Diária em andamento' : 'Registrar chegada'} accentColor="#FF6B2C" onBack={() => navigation.goBack()} allowBackWithSidebar={desktop} compact={desktop}
        subtitle={desktop ? "Acompanhe o serviço, os registros e os pagamentos." : undefined} />
      <ScrollView style={styles.content} contentContainerStyle={[baseStyles.contentContainer, desktop && baseStyles.desktopContent]} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color="#FF6B2C" />}
        {desktop ? <View style={baseStyles.desktopColumns}>
          <View style={baseStyles.desktopOverview}>{overview}</View>
          <View style={baseStyles.desktopActivity}>
            <Text style={baseStyles.desktopPanelTitle}>Acompanhamento da diária</Text>
            {activity}
          </View>
        </View> : <>{overview}{activity}</>}
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

function StageNotice({ icon, title, steps, tone = 'info' }: {
  icon: React.ComponentProps<typeof Ionicons>['name']; title: string; steps: string[]; tone?: 'info' | 'error';
}) {
  return <View style={[baseStyles.stageNotice, tone === 'error' && baseStyles.errorNotice]}>
    <Ionicons name={icon} size={22} color={tone === 'error' ? '#B42318' : '#C2410C'} />
    <View style={baseStyles.rowInfo}>
      <Text style={baseStyles.blockTitle}>{title}</Text>
      {steps.map(step => <Text key={step} style={baseStyles.noticeStep}>• {step}</Text>)}
    </View>
  </View>;
}
