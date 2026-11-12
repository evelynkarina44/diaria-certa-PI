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
  Pendente: 'Aguardando pagamento', Pago: 'Pagamento aprovado', Falhou: 'Pagamento não aprovado',
  Estornado: 'Pagamento estornado', Estorno_pendente: 'Estorno em processamento', Em_disputa: 'Pagamento em análise',
};

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
        setNotice('Se ainda estiver processando, use Atualizar pagamento para consultar novamente.');
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
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Voltar" style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Pagamento da diária</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Pagamento em duas etapas</Text>
        <Text style={styles.text}>50% após o aceite da diarista e o restante após o checkout. Não há cobrança ao enviar a solicitação.</Text>
        {summary && summary.id_agendamento === id && isClient && <>
          <Text style={styles.text}>Agendamento #{summary.id_agendamento} • {summary.checkin_expirado ? 'Check-in expirado' : summary.status_agendamento.replace(/_/g, ' ')}</Text>
          {route.params?.dataAgendamento && <Text style={styles.text}>Data da diária: {route.params.dataAgendamento}</Text>}
          <Text style={styles.amount}>Total: {money(summary.valor_total)}</Text>
          {summary.parcelas.map((installment) => (
            <View key={installment.fase} style={styles.card}>
              <Text style={styles.heading}>{installment.fase === 'Entrada' ? '1. Entrada — 50%' : '2. Saldo — 50%'}</Text>
              <Text style={styles.amount}>{money(installment.valor)}</Text>
              <Text style={installment.status === 'Pago' ? styles.success : styles.text}>{labels[installment.status]}</Text>
              {installment.estorno_pendente && <Text style={styles.text}>Há uma devolução em processamento. A devolução efetiva depende do Mercado Pago.</Text>}
              {installment.pode_pagar ? (
                <TouchableOpacity style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={() => void pay(installment)}>
                  <Text style={styles.buttonText}>{installment.fase === 'Entrada' ? 'Pagar entrada' : 'Pagar saldo'} no Mercado Pago</Text>
                </TouchableOpacity>
              ) : installment.status === 'Pendente' && !summary.checkin_expirado && (
                <Text style={styles.text}>{installment.fase === 'Entrada'
                  ? 'Disponível depois que a diarista aceitar a solicitação.'
                  : 'Disponível após a diarista finalizar a diária e registrar o checkout.'}</Text>
              )}
            </View>
          ))}
          {summary.checkin_expirado && <Text style={styles.error}>Check-in expirado: a diária não foi iniciada no prazo de 30 minutos. A entrada paga será estornada integralmente; a devolução depende da confirmação do Mercado Pago.</Text>}
          {summary.quitado && <Text style={styles.success}>As duas parcelas foram aprovadas. Diária quitada.</Text>}
          {!summary.checkin_expirado && ['Pendente', 'Aceito'].includes(summary.status_agendamento) && (
            <View style={styles.card}>
              <TouchableOpacity disabled={busy} onPress={() => setConfirmCancel(true)}>
                <Text style={styles.error}>Cancelar agendamento</Text>
              </TouchableOpacity>
            </View>
          )}
        </>}
        {busy && <ActivityIndicator color="#18C7C8" />}
        {Boolean(id) && isClient && (
          <TouchableOpacity style={[styles.outline, busy && styles.disabled]} disabled={busy} onPress={() => void load(true)}>
            <Text style={styles.outlineText}>Atualizar pagamento</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.text}>Pix e cartões são escolhidos no ambiente seguro do Mercado Pago, conforme disponibilidade. Não informe dados de cartão nesta aplicação.</Text>
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
