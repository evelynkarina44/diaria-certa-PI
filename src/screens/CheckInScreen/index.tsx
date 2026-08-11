import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { checkinCheckoutService } from '../../services/checkinCheckoutService';
import { getErrorMessage } from '../../services/api';

type FormaPagamento = 'pix' | 'cartao' | 'nova';

export default function CheckInScreen({ navigation, route }: any) {
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>('pix');
  const [loading, setLoading] = useState(false);
  const agendamentoId = Number(route.params?.agendamentoId);

  async function confirmarCheckIn() {
    if (!agendamentoId) {
      Alert.alert('Agendamento ausente', 'Abra o check-in a partir de uma diária.');
      return;
    }
    try {
      setLoading(true);
      await checkinCheckoutService.confirmarPagamento(agendamentoId);
      Alert.alert('Check-in confirmado', 'O serviço foi iniciado.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Não foi possível confirmar', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            Diarista solicitou o Check In
          </Text>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={40}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                Maria da Silva
              </Text>

              <View style={styles.ratingRow}>
                <Text style={styles.rating}>
                  4.9
                </Text>

                <Ionicons
                  name="star"
                  size={14}
                  color="#FFB800"
                />

                <Ionicons
                  name="star"
                  size={14}
                  color="#FFB800"
                />

                <Ionicons
                  name="star"
                  size={14}
                  color="#FFB800"
                />

                <Ionicons
                  name="star"
                  size={14}
                  color="#FFB800"
                />
              </View>

              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color="#111111"
                />

                <Text style={styles.dateText}>
                  Dia 31 de Julho
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Serviços solicitados
          </Text>

          <View style={styles.servicePill}>
            <Text style={styles.serviceText}>
              Limpeza Geral
            </Text>
          </View>

          <View style={styles.paymentTitleRow}>
            <Text style={styles.sectionTitle}>
              Forma de pagamento
            </Text>

            <Text style={styles.time}>
              14:54
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formaPagamento === 'pix' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaPagamento('pix')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentIcon}>
              <Ionicons
                name="diamond"
                size={25}
                color="#18C7C8"
              />
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>
                Pix
              </Text>

              <Text style={styles.paymentDescription}>
                Pagamento instantâneo
              </Text>
            </View>

            <Ionicons
              name={
                formaPagamento === 'pix'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={21}
              color={
                formaPagamento === 'pix'
                  ? '#18C7C8'
                  : '#B5B5B5'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formaPagamento === 'cartao' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaPagamento('cartao')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentIcon}>
              <Ionicons
                name="card-outline"
                size={26}
                color="#8F8F8F"
              />
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>
                Cartão de crédito
              </Text>

              <Text style={styles.paymentDescription}>
                **** **** **** 1234
              </Text>
            </View>

            <Ionicons
              name={
                formaPagamento === 'cartao'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={21}
              color={
                formaPagamento === 'cartao'
                  ? '#18C7C8'
                  : '#B5B5B5'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formaPagamento === 'nova' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaPagamento('nova')}
            activeOpacity={0.8}
          >
            <View style={styles.addIcon}>
              <Ionicons
                name="add"
                size={24}
                color="#B5B5B5"
              />
            </View>

            <Text style={styles.newPaymentText}>
              Nova forma de pagamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkInButton}
            onPress={confirmarCheckIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={'#FFFFFF'} />
            ) : (
              <Text style={styles.checkInButtonText}>
                Confirmar Check In
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
