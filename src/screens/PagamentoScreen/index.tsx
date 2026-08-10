import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type FormaPagamento = 'pix' | 'cartao' | '';

export default function PagamentoScreen({ navigation }: any) {
  const [formaSelecionada, setFormaSelecionada] =
    useState<FormaPagamento>('pix');

  function handlePagar() {
    if (formaSelecionada === 'pix') {
      navigation.navigate('PagamentoPix');
      return;
    }

    navigation.navigate('PagamentoRealizado');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="chevron-back"
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Pagamento
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Resumo do agendamento
          </Text>

          <View style={styles.summaryList}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Diarista
              </Text>

              <Text style={styles.summaryValue}>
                Maria da Silva
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Data
              </Text>

              <Text style={styles.summaryValue}>
                15/04/2024
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Horário
              </Text>

              <Text style={styles.summaryValue}>
                09:00
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Serviço
              </Text>

              <Text style={styles.summaryValue}>
                Limpeza geral
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Valor total
              </Text>

              <Text style={styles.summaryValue}>
                R$ 120,00
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.paymentTitle}>
            Forma de pagamento
          </Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formaSelecionada === 'pix' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaSelecionada('pix')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentIcon}>
              <Ionicons
                name="diamond"
                size={27}
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
                formaSelecionada === 'pix'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={23}
              color={
                formaSelecionada === 'pix'
                  ? '#18C7C8'
                  : '#B5B5B5'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formaSelecionada === 'cartao' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaSelecionada('cartao')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentIcon}>
              <Ionicons
                name="card-outline"
                size={28}
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
                formaSelecionada === 'cartao'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={23}
              color={
                formaSelecionada === 'cartao'
                  ? '#18C7C8'
                  : '#B5B5B5'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() =>
              navigation.navigate('AdicionarPagamento')
            }
            activeOpacity={0.8}
          >
            <View style={styles.addPaymentIcon}>
              <Ionicons
                name="add"
                size={27}
                color="#B5B5B5"
              />
            </View>

            <Text style={styles.addPaymentText}>
              Nova forma de pagamento
            </Text>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#A0A0A0"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.totalArea}>
          <Text style={styles.totalLabel}>
            Valor total:
          </Text>

          <Text style={styles.totalValue}>
            R$ 120,00
          </Text>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePagar}
            activeOpacity={0.85}
          >
            <Text style={styles.payButtonText}>
              Pagar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}