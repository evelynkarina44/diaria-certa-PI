import { PageHeader } from '../../components/page-header';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';
import { ActivityIndicator, AppState, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { pagamentoService, type ParcelaPagamento, type ResumoPagamento } from '../../services/pagamentoService';
import { getErrorMessage } from '../../services/api';
import { agendamentoService } from '../../services/agendamentoService';
import { paymentStyles as styles } from './paymentStyles';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const labels: Record<ParcelaPagamento['status'], string> = {
  Pendente: 'Pendente', Pago: 'Pago', Falhou: 'Não aprovado',
  Estornado: 'Estornado', Estorno_pendente: 'Estorno em processamento', Em_disputa: 'Em análise',
};

function installmentLabel(installment: ParcelaPagamento, summary: ResumoPagamento) {
  if (installment.estorno_pendente) return 'Estorno em processamento';
  if (installment.status !== 'Pendente') return labels[installment.status];
  if (summary.confirmacao_cliente_expirada || summary.checkin_expirado || ['Cancelado', 'Recusado', 'Expirado'].includes(summary.status_agendamento)) return 'Sem cobrança';
  if (installment.pode_pagar) return 'Aguardando pagamento';
  return installment.fase === 'Entrada' ? 'Libera após o aceite' : 'Libera após o checkout';
}

function paymentNotice(summary: ResumoPagamento) {
  const entry = summary.parcelas.find(item => item.fase === 'Entrada');
  const pendingRefund = summary.parcelas.some(item => item.estorno_pendente || item.status === 'Estorno_pendente');
  const parts: string[] = [];
  if (summary.confirmacao_cliente_expirada) parts.push('O cliente não confirmou o início em 30 min. Diária encerrada.');
  else if (summary.checkin_expirado) parts.push('Sem check-in em 30 min. Diária encerrada.');
  if (pendingRefund) parts.push('Estorno integral em processamento pelo Mercado Pago.');
  else if ((summary.checkin_expirado || summary.confirmacao_cliente_expirada) && entry?.status === 'Estornado') parts.push('Entrada devolvida integralmente.');
  else if ((summary.checkin_expirado || summary.confirmacao_cliente_expirada) && entry?.status === 'Pago') parts.push('Entrada paga: estorno integral sujeito à confirmação do Mercado Pago.');
  return parts.join(' ');
}

// O navegador nunca decide se foi pago. Todos os estados vêm da API autenticada.
export default function PagamentoScreen({ navigation, route }: any) {
  const { user } = useAuth();
  // Uma diária nunca reutiliza o estado ou as consultas da diária anterior.
  const paymentKey = `${user?.id_usuario}:${user?.activeProfile}:${route.params?.agendamentoId}`;
  return <PagamentoDoAgendamento key={paymentKey} navigation={navigation} route={route} />;
}

function PagamentoDoAgendamento({ navigation, route }: any) {
  const { user } = useAuth();
  const id = Number(route.params?.agendamentoId);
  const [summary, setSummary] = useState<ResumoPagamento | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const epoch = useRef(0);
  const loading = useRef(false);
  const reviewOpened = useRef(false);
  const isClient = user?.activeProfile === 'CLIENTE';

  async function load(sync = false, silent = false) {
    if (!id || !isClient || loading.current) return;
    const requestEpoch = epoch.current;
    loading.current = true; setBusy(true);
    try {
      const result = sync ? await pagamentoService.sincronizar(id) : await pagamentoService.buscar(id);
      if (requestEpoch !== epoch.current) return;
      setSummary(result); if (!silent) setError('');
      if (result.quitado) setOpened(false);
      // O retorno do checkout não prova pagamento: só a API libera a avaliação.
      if (result.pode_avaliar && navigation.isFocused() && !reviewOpened.current) {
        reviewOpened.current = true;
        navigation.replace('Avaliacao', { agendamentoId: id });
      }
    } catch (cause) {
      if (requestEpoch === epoch.current && !silent) setError(getErrorMessage(cause));
    } finally {
      if (requestEpoch === epoch.current) { setBusy(false); loading.current = false; }
    }
  }

  useEffect(() => {
    epoch.current++; loading.current = false;
    setSummary(null); setError(''); setNotice(''); setOpened(false); setConfirmCancel(false);
    if (!id) setError('Abra o pagamento por Minhas diárias, escolhendo um agendamento.');
    else if (!isClient) setError('Ative o perfil de cliente para pagar sua diária.');
    else void load();
    const unsubscribe = navigation.addListener('focus', () => void load());
    return () => { epoch.current++; loading.current = false; unsubscribe(); };
  }, [id, user?.id_usuario, isClient, navigation]);

  useEffect(() => {
    if (!opened) return;
    let attempts = 0;
    const timer = setInterval(() => {
      if (!navigation.isFocused() || AppState.currentState !== 'active') return;
      attempts++; void load(true, true);
      if (attempts >= 8) {
        clearInterval(timer);
        setNotice('Se ainda estiver processando, toque no ícone de atualização para consultar novamente.');
      }
    }, 15000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void load(true); });
    const onFocus = () => void load(true);
    if (Platform.OS === 'web') window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer); subscription.remove();
      if (Platform.OS === 'web') window.removeEventListener('focus', onFocus);
    };
  }, [opened, id, isClient, user?.id_usuario]);

  // Mostra a liberação do saldo quando a diarista faz checkout em outra sessão.
  useEffect(() => {
    if (opened || !id || !isClient) return;
    const timer = setInterval(() => {
      if (navigation.isFocused() && AppState.currentState === 'active') void load(false, true);
    }, 15000);
    return () => clearInterval(timer);
  }, [opened, id, isClient, user?.id_usuario, navigation]);

  async function pay(installment: ParcelaPagamento) {
    if (loading.current || !installment.pode_pagar) return;
    const requestEpoch = epoch.current;
    const tab = Platform.OS === 'web' ? window.open('', '_blank') : null;
    if (tab) tab.opener = null;
    loading.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await pagamentoService.checkout(id, installment.fase);
      if (requestEpoch !== epoch.current) { tab?.close(); return; }
      if (Platform.OS === 'web') {
        if (!tab) throw new Error('Permita pop-ups para abrir o checkout seguro do Mercado Pago.');
        tab.location.href = result.checkout_url;
      } else await Linking.openURL(result.checkout_url);
      setOpened(true);
      setNotice('Conclua o pagamento no Mercado Pago. Voltar à aplicação não significa que ele foi aprovado.');
    } catch (cause) {
      tab?.close();
      if (requestEpoch === epoch.current) setError(getErrorMessage(cause));
    } finally {
      if (requestEpoch === epoch.current) { loading.current = false; setBusy(false); }
    }
  }

  async function cancel() {
    if (loading.current) return;
    const requestEpoch = epoch.current;
    loading.current = true; setBusy(true); setError('');
    try {
      await agendamentoService.cancelar(id);
      const result = await pagamentoService.buscar(id);
      if (requestEpoch !== epoch.current) return;
      setSummary(result); setOpened(false); setConfirmCancel(false);
      setNotice('Agendamento cancelado. Se a entrada já foi paga, o estorno integral será processado pelo Mercado Pago.');
    } catch (cause) {
      if (requestEpoch === epoch.current) setError(getErrorMessage(cause));
    } finally {
      if (requestEpoch === epoch.current) { loading.current = false; setBusy(false); }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageHeader title="Pagamento da diária" accentColor="#18C7C8" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {summary && summary.id_agendamento === id && isClient && <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.booking}>DIÁRIA #{summary.id_agendamento}</Text>
              <Text style={styles.bookingStatus}>{summary.confirmacao_cliente_expirada ? 'Confirmação não recebida' : summary.checkin_expirado ? 'Check-in expirado' : summary.status_agendamento === 'Concluido' ? 'Concluído' : summary.status_agendamento.replace(/_/g, ' ')}</Text>
            </View>
            {route.params?.dataAgendamento && <View style={styles.iconRow}>
              <Ionicons name="calendar-outline" size={16} color="#657383" /><Text style={styles.caption}>{route.params.dataAgendamento}</Text>
            </View>}
            <Text style={styles.totalLabel}>Total da diária</Text>
            <Text style={styles.totalAmount}>{money(summary.valor_total)}</Text>
            <Text style={styles.caption}>50% após o aceite · 50% após o checkout</Text>
          </View>
          {summary.parcelas.map((installment) => (
            <View key={installment.fase} style={styles.card}>
              <View style={styles.installmentTop}>
                <View style={styles.installmentName}>
                  <Ionicons name={installment.fase === 'Entrada' ? 'wallet-outline' : 'checkmark-done-outline'} size={19} color="#008A99" />
                  <Text style={styles.installmentTitle}>{installment.fase === 'Entrada' ? 'Entrada' : 'Saldo'} · 50%</Text>
                </View>
                <Text style={styles.installmentAmount}>{money(installment.valor)}</Text>
              </View>
              <View style={styles.iconRow}>
                <Ionicons name={installment.estorno_pendente || installment.status === 'Estorno_pendente' ? 'return-down-back-outline'
                  : installment.status === 'Pago' ? 'checkmark-circle-outline' : installment.status === 'Falhou' ? 'alert-circle-outline' : 'time-outline'}
                  size={16} color={installment.status === 'Pago' && !installment.estorno_pendente ? '#087F5B' : '#657383'} />
                <Text style={installment.status === 'Pago' && !installment.estorno_pendente ? styles.success : styles.caption}>{installmentLabel(installment, summary)}</Text>
              </View>
              {installment.pode_pagar && (
                <TouchableOpacity accessibilityRole="button" style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={() => void pay(installment)}>
                  <Text style={styles.buttonText}>{installment.fase === 'Entrada' ? 'Pagar entrada' : 'Pagar saldo'}</Text>
                  <Ionicons name="open-outline" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {Boolean(paymentNotice(summary)) && <View style={styles.noticeBox}>
            <Ionicons name={summary.checkin_expirado ? 'alarm-outline' : 'return-down-back-outline'} size={20} color="#B54708" />
            <Text style={styles.noticeText}>{paymentNotice(summary)}</Text>
          </View>}
          {summary.quitado && <View style={styles.iconRow}><Ionicons name="checkmark-circle" size={20} color="#087F5B" /><Text style={styles.success}>Diária quitada</Text></View>}
          {!summary.checkin_expirado && !summary.confirmacao_cliente_expirada && ['Pendente', 'Aceito'].includes(summary.status_agendamento) && (
            <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setConfirmCancel(true)} style={styles.cancelButton}>
              <Ionicons name="close-circle-outline" size={18} color="#C62828" /><Text style={styles.error}>Cancelar agendamento</Text>
            </TouchableOpacity>
          )}
        </>}
        {busy && <ActivityIndicator color="#18C7C8" />}
        {Boolean(id) && isClient && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar pagamento" accessibilityState={{ disabled: busy, busy }} style={[{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: '#E8FAFA' }, busy && styles.disabled]} disabled={busy} onPress={() => void load(true)}>
            {busy ? <ActivityIndicator size="small" color="#008A99" /> : <Ionicons name="refresh-outline" size={22} color="#008A99" />}
          </TouchableOpacity>
        )}
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#657383" />
          <Text style={styles.securityText}>Pagamento seguro pelo Mercado Pago</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.infoButton} onPress={() => setNotice('Não há cobrança ao solicitar a diária. A entrada (50%) é liberada após o aceite; o saldo (50%), após o checkout. Pix e cartões ficam disponíveis no Mercado Pago, conforme disponibilidade. Não informe dados de cartão neste aplicativo. A aprovação e os estornos dependem da confirmação do Mercado Pago.')}>
          <Ionicons name="information-circle-outline" size={18} color="#008A99" /><Text style={styles.outlineText}>Como funciona</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outline} onPress={() => navigation.navigate('AcompanharDiarias')}>
          <Text style={styles.outlineText}>Acompanhar minhas diárias</Text>
        </TouchableOpacity>
      </ScrollView>
      <ActionModal visible={Boolean(error)} variant="error" title="Não foi possível concluir" message={error} onClose={() => { setError(''); setConfirmCancel(false); }} />
      <ActionModal visible={!error && Boolean(notice)} variant="info" title="Pagamento da diária" message={notice} onClose={() => setNotice('')} />
      <ActionModal visible={confirmCancel && !error && !notice} variant="confirm" title="Cancelar agendamento?"
        message="Deseja cancelar esta diária? Se a entrada já foi paga, será solicitado o estorno integral. A devolução não é instantânea."
        confirmLabel="Sim, cancelar" cancelLabel="Manter diária" busy={busy}
        onConfirm={cancel} onClose={() => setConfirmCancel(false)} />
    </SafeAreaView>
  );
}
