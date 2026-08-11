import React, { useEffect, useState } from 'react';

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
import { diaristaService } from '../../services/diaristaService';
import { getErrorMessage } from '../../services/api';
import type { Diarista } from '../../services/types';

export default function PerfilDiaristaScreen({
  navigation,
  route,
}: any) {
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [loading, setLoading] = useState(true);
  const diaristaId = Number(route.params?.diaristaId);

  useEffect(() => {
    if (!diaristaId) {
      setLoading(false);
      return;
    }
    diaristaService
      .buscarPorId(diaristaId)
      .then(setProfile)
      .catch((error) =>
        Alert.alert('Não foi possível carregar o perfil', getErrorMessage(error)),
      )
      .finally(() => setLoading(false));
  }, [diaristaId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={'#18C7C8'} />
      </SafeAreaView>
    );
  }

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
            {profile?.usuario?.nome ?? 'Diarista'}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>
              {Number(profile?.avaliacao_media ?? 0).toFixed(1)}
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
              ({profile?.avaliacao?.length ?? 0} avaliações)
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Sobre
          </Text>

          <Text style={styles.aboutText}>
            {profile?.descricao ?? 'Descrição não informada.'}
          </Text>

          <Text style={styles.sectionTitle}>
            Serviços
          </Text>

          <View style={styles.servicesGrid}>
            {(profile?.diarista_servico ?? []).map((item) => (
              <View
                key={item.id_diarista_servico}
                style={styles.serviceButton}
              >
                <Text style={styles.serviceText}>
                  {item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
  style={styles.scheduleButton}
  onPress={() => navigation.navigate('AgendarDiaria', { diaristaId })}
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
