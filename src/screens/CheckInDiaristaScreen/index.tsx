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
import { agendamentoService } from '../../services/agendamentoService';
import { checkinCheckoutService } from '../../services/checkinCheckoutService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';

export default function CheckInDiaristaScreen({
  navigation,
  route,
}: any) {
  const agendamentoId = Number(route.params?.agendamentoId);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!agendamentoId) {
      setLoading(false);
      return;
    }
    agendamentoService
      .buscarPorId(agendamentoId)
      .then(setAgendamento)
      .catch((error) =>
        Alert.alert('Não foi possível carregar a diária', getErrorMessage(error)),
      )
      .finally(() => setLoading(false));
  }, [agendamentoId]);

  async function solicitarCheckIn() {
    if (!agendamentoId) return;
    try {
      setSending(true);
      await checkinCheckoutService.solicitar(agendamentoId);
      Alert.alert('Check-in solicitado', 'O cliente já pode confirmar o pagamento.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Não foi possível solicitar o check-in', getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.orangeHeader} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading && <ActivityIndicator color={'#FF6B2C'} />}
        <Text style={styles.title}>
          Solicitar Check In
        </Text>

        <View style={styles.divider} />

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={43}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {agendamento?.cliente?.usuario?.nome ?? 'Cliente'}
              </Text>

              <Ionicons
                name="female"
                size={14}
                color="#18C7C8"
              />
            </View>

            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                4.9
              </Text>

              {[1, 2, 3, 4].map((estrela) => (
                <Ionicons
                  key={estrela}
                  name="star"
                  size={13}
                  color="#FFB800"
                />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Serviços solicitados
        </Text>

        <View style={styles.serviceBadge}>
          <Text style={styles.serviceText}>
            {agendamento?.agendamento_servico?.[0]?.diarista_servico?.servico?.nome_servico
              ?? 'Serviço'}
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={23}
              color="#18C7C8"
            />

            <Text style={styles.locationTitle}>
              Localização
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="search"
              size={21}
              color="#A0A0A0"
            />

            <Text style={styles.address}>
              {agendamento?.endereco
                ? `${agendamento.endereco.logradouro} ${agendamento.endereco.numero} - ${agendamento.endereco.bairro}`
                : 'Endereço não informado'}
            </Text>
          </View>
        </View>

        <Text style={styles.imagesTitle}>
          Imagens da residência
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesRow}
        >
          {[1, 2, 3].map((imagem) => (
            <View
              key={imagem}
              style={styles.houseImage}
            >
              <Ionicons
                name="image-outline"
                size={38}
                color="#AAAAAA"
              />

              <Text style={styles.imagePlaceholder}>
                Imagem {imagem}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.checkInButton}
          onPress={solicitarCheckIn}
          disabled={sending || !agendamentoId}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color={'#FFFFFF'} />
          ) : (
            <Text style={styles.checkInButtonText}>
              Solicitar Check In
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
