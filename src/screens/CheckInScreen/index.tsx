import { PageHeader } from '../../components/page-header';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ActionModal } from '../../components/action-modal';
import { agendamentoService } from '../../services/agendamentoService';
import { checkinCheckoutService } from '../../services/checkinCheckoutService';
import { pagamentoService, type ResumoPagamento } from '../../services/pagamentoService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';
import { paymentStyles as styles } from '../PagamentoScreen/paymentStyles';

const stamp = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
export default function CheckInScreen(props: any) {
  return <Confirmacao key={props.route.params?.agendamentoId} {...props} />;
}
function Confirmacao({ navigation, route }: any) {
  const id = Number(route.params?.agendamentoId);
  const [appointment, setAppointment] = useState<Agendamento | null>(null);
  const [payment, setPayment] = useState<ResumoPagamento | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmStart, setConfirmStart] = useState(false);
  const [now, setNow] = useState(Date.now());
  const locked = useRef(false);
  const alive = useRef(true);
  const reload = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    let active = true, fetching = false;
    alive.current = true;
    async function load(silent = false) {
      if (!active || fetching || locked.current) return;
      if (!Number.isSafeInteger(id) || id <= 0) { setError('Abra a confirmação a partir de uma diária.'); return; }
      fetching = true;
      if (!silent) setBusy(true);
      try {
        const [booking, summary] = await Promise.all([agendamentoService.buscarPorId(id), pagamentoService.buscar(id)]);
        if (booking.id_agendamento !== id || summary.id_agendamento !== id) throw new Error('Dados de outra diária. Abra novamente o agendamento.');
        if (active) { setAppointment(booking); setPayment(summary); }
      } catch (cause) { if (active && !silent) setError(getErrorMessage(cause)); }
      finally { fetching = false; if (active && !silent) setBusy(false); }
    }
    reload.current = load;
    void load();
    const unsubscribe = navigation.addListener('focus', () => void load());
    const subscription = AppState.addEventListener('change', state => { if (state === 'active' && navigation.isFocused()) void load(); });
    const timer = setInterval(() => {
      setNow(Date.now());
      if (navigation.isFocused() && AppState.currentState === 'active') void load(true);
    }, 15000);
    return () => { active = false; alive.current = false; unsubscribe(); subscription.remove(); clearInterval(timer); };
  }, [id, navigation]);

  const check = appointment?.checkin_checkout?.[0];
  const entryPaid = payment?.parcelas.some(item => item.fase === 'Entrada' && item.status === 'Pago');
  const limit = appointment?.confirmacao_cliente_limite_em
    ?? (check?.horario_chegada ? new Date(new Date(check.horario_chegada).getTime() + 30 * 60000).toISOString() : null);
  const confirmationExpired = appointment?.confirmacao_cliente_expirada || (appointment?.status === 'Aceito' && Boolean(limit) && !check?.horario_checkin && now >= new Date(limit!).getTime());
  const running = appointment?.status === 'Em_andamento' || Boolean(check?.horario_checkin);
  const canConfirm = appointment?.status === 'Aceito' && Boolean(check?.horario_chegada) && entryPaid
    && ['Checkin_solicitado', 'Aguardando_pagamento'].includes(check?.status_checkin ?? '') && !confirmationExpired && !appointment?.checkin_expirado;
  async function confirm() {
    if (locked.current || !canConfirm) return;
    locked.current = true; setBusy(true); setError(''); setSuccess('');
    let updated = false;
    try {
      await checkinCheckoutService.confirmarInicio(id);
      updated = true;
      if (alive.current) { setConfirmStart(false); setSuccess('Início confirmado. A diária está em andamento; o saldo será liberado após o checkout da diarista.'); }
    } catch (cause) { if (alive.current) { setConfirmStart(false); setError(getErrorMessage(cause)); } }
    finally {
      locked.current = false;
      if (alive.current) { setBusy(false); if (updated) await reload.current(); }
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Confirmar início" accentColor="#18C7C8" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {appointment && <View style={styles.card}>
          <Text style={styles.heading}>{appointment.diarista?.usuario?.nome || 'Diarista'}</Text>
          <Text style={styles.caption}>Diária #{id} · {new Date(appointment.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
          {appointment.endereco && <View style={styles.iconRow}><Ionicons name="location-outline" size={18} color="#008A99" /><Text style={styles.caption}>{appointment.endereco.apelido ? appointment.endereco.apelido + ' — ' : ''}{appointment.endereco.logradouro}, {appointment.endereco.numero}</Text></View>}
          {confirmationExpired ? <Text style={styles.text}>A chegada foi registrada, mas o início não foi confirmado em 30 minutos. A diária foi encerrada por falta de confirmação do cliente. A entrada paga terá estorno integral.</Text>
            : appointment.checkin_expirado ? <Text style={styles.text}>A diarista não registrou a chegada no prazo. Consulte o encerramento e eventual estorno nos pagamentos.</Text>
            : appointment.status === 'Concluido' ? <Text style={styles.success}>Diária finalizada. Consulte o pagamento do saldo.</Text>
            : running ? <Text style={styles.success}>Início confirmado. Diária em andamento.</Text>
            : appointment.status !== 'Aceito' ? <Text style={styles.text}>Esta diária não está disponível para iniciar.</Text>
            : check?.horario_chegada ? <>
              <View style={styles.iconRow}><Ionicons name="home-outline" size={22} color="#008A99" /><Text style={styles.heading}>A diarista chegou</Text></View>
              <Text style={styles.caption}>Chegada registrada em {stamp(check.horario_chegada)}.</Text>
              <Text style={styles.text}>Confirme somente se a profissional estiver no endereço e puder começar. Isso registra o início, sem nova cobrança.</Text>
              {limit && <Text style={styles.caption}>Confirme até {stamp(limit)}. Sem confirmação em 30 minutos, a diária será encerrada com estorno integral da entrada paga.</Text>}
              {!entryPaid && <Text style={styles.text}>Pague a entrada de 50% antes de confirmar o início.</Text>}
            </> : <Text style={styles.text}>Aguarde a diarista tocar em Cheguei. Você receberá um aviso no sininho e poderá confirmar o início aqui.</Text>}
          {canConfirm && <TouchableOpacity accessibilityRole="button" disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={() => setConfirmStart(true)}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" /><Text style={styles.buttonText}>Confirmar chegada e iniciar</Text>
          </TouchableOpacity>}
          {!entryPaid && payment?.parcelas.some(item => item.fase === 'Entrada' && item.pode_pagar) && <TouchableOpacity style={styles.outline} onPress={() => navigation.navigate('Pagamento', { agendamentoId: id })}><Text style={styles.outlineText}>Pagar entrada</Text></TouchableOpacity>}
        </View>}
        {busy && <ActivityIndicator color="#18C7C8" />}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar diária" accessibilityState={{ disabled: busy, busy }} disabled={busy} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: '#E8FAFA' }} onPress={() => void reload.current()}>{busy ? <ActivityIndicator size="small" color="#008A99" /> : <Ionicons name="refresh-outline" size={22} color="#008A99" />}</TouchableOpacity>
        <TouchableOpacity style={styles.outline} onPress={() => navigation.navigate('AcompanharDiarias')}><Text style={styles.outlineText}>Minhas diárias</Text></TouchableOpacity>
      </ScrollView>
      <ActionModal visible={Boolean(error)} variant="error" title="Não foi possível confirmar" message={error} onClose={() => setError('')} />
      <ActionModal visible={!error && Boolean(success)} variant="success" title="Diária iniciada" message={success} confirmLabel="Acompanhar diária"
        onClose={() => { setSuccess(''); navigation.navigate('AcompanharDiarias'); }} />
      <ActionModal visible={confirmStart && !error && !success} variant="confirm" title="A diarista está no local?"
        message="Confirme apenas se a profissional chegou e o serviço pode começar. O horário de início será registrado agora. Nenhuma parcela é cobrada ao confirmar."
        confirmLabel="Sim, iniciar diária" cancelLabel="Ainda não" busy={busy} onConfirm={confirm} onClose={() => setConfirmStart(false)} />
    </SafeAreaView>
  );
}
