import React from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

export default function PagamentoRealizadoScreen({
  navigation,
}: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Pagamento realizado!
        </Text>

        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={73}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.summaryCard}>
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

        <View style={styles.buttonsArea}>
          <TouchableOpacity
            style={styles.schedulesButton}
            onPress={() =>
              navigation.navigate('EncontrarDiarista')
            }
            activeOpacity={0.85}
          >
            <Text style={styles.schedulesButtonText}>
              Ver agendamentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('EncontrarDiarista')
            }
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}