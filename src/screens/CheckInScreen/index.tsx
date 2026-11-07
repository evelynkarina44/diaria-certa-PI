import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { agendamentoService } from '../../services/agendamentoService';
import { checkinCheckoutService } from '../../services/checkinCheckoutService';
import { pagamentoService, type ResumoPagamento } from '../../services/pagamentoService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';
import { paymentStyles as styles } from '../PagamentoScreen/paymentStyles';

export default function CheckInScreen({ navigation, route }: any) {
  const id = Number(route.params?.agendamentoId);
  const [appointment, setAppointment] = useState<Agendamento | null>(null);
  const [payment, setPayment] = useState<ResumoPagamento | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) { setError('Abra o check-in a partir de um agendamento.'); return; }
      setBusy(true);
      try {
        const [booking, summary] = await Promise.all([agendamentoService.buscarPorId(id), pagamentoService.buscar(id)]);
        if (active) { setAppointment(booking); setPayment(summary); }
      } catch (cause) { if (active) setError(getErrorMessage(cause)); }
      finally { if (active) setBusy(false); }
    }
    void load();
    const unsubscribe = navigation.addListener('focus', load);
    return () => { active = false; unsubscribe(); };
  }, [id, navigation]);

  async function confirm() {
    setBusy(true); setError(''); setSuccess('');
    try {
      await checkinCheckoutService.confirmarPagamento(id);
      setSuccess('Presença confirmada. A diária foi iniciada; o saldo será liberado após o checkout.');
      setAppointment(await agendamentoService.buscarPorId(id));
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  const entryPaid = payment?.parcelas.some((item) => item.fase === 'Entrada' && item.status === 'Pago');
  const checkRequested = appointment?.checkin_checkout?.some((item) => ['Checkin_solicitado', 'Aguardando_pagamento'].includes(item.status_checkin));
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Voltar" style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirmar check-in</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {appointment && <View style={styles.card}>
          <Text style={styles.heading}>{appointment.diarista?.usuario?.nome || 'Diarista'}</Text>
          <Text style={styles.text}>{new Date(appointment.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
          <Text style={styles.text}>Agendamento #{id}</Text>
          <Text style={styles.text}>A entrada precisa estar aprovada. Confirmar o check-in não realiza nova cobrança.</Text>
          {!entryPaid && <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Pagamento', { agendamentoId: id })}>
            <Text style={styles.buttonText}>Consultar pagamento da entrada</Text>
          </TouchableOpacity>}
          {entryPaid && checkRequested && appointment.status === 'Aceito' && (
            <TouchableOpacity disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={() => void confirm()}>
              <Text style={styles.buttonText}>Confirmar presença e iniciar diária</Text>
            </TouchableOpacity>
          )}
          {!checkRequested && !success && <Text style={styles.text}>Aguarde a solicitação de check-in da diarista.</Text>}
        </View>}
        {busy && <ActivityIndicator color="#18C7C8" />}
        {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {Boolean(success) && <Text style={styles.success}>{success}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
