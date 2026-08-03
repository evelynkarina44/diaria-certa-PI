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

const servicos = [
  'Limpeza Geral',
  'Passar Roupas',
  'Limpeza Pesada',
  'Cozinha',
];

export default function PerfilDiaristaScreen({
  navigation,
}: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Voltar"
          >
            <Ionicons
              name="chevron-back"
              size={29}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="person"
              size={84}
              color="#D1D1D1"
            />
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.name}>
            Maria da Silva
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>
              4.9
            </Text>

            {[1, 2, 3, 4, 5].map((item) => (
              <Ionicons
                key={item}
                name="star"
                size={19}
                color="#FFB800"
              />
            ))}

            <Text style={styles.ratingCount}>
              (128 avaliações)
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Sobre
          </Text>

          <Text style={styles.aboutText}>
            Trabalho como diarista há 4 anos, sou organizada e
            de confiança.
          </Text>

          <Text style={styles.sectionTitle}>
            Serviços
          </Text>

          <View style={styles.servicesGrid}>
            {servicos.map((servico) => (
              <View
                key={servico}
                style={styles.serviceButton}
              >
                <Text style={styles.serviceText}>
                  {servico}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
  style={styles.scheduleButton}
  onPress={() => navigation.navigate('AgendarDiaria')}
  activeOpacity={0.85}
>
  <Text style={styles.scheduleButtonText}>
    Agendar diária
  </Text>
</TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}