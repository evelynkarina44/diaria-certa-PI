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
import { useAuth } from '../../contexts/GlobalContext';
import { agendamentoService } from '../../services/agendamentoService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';
import { LogoutButton } from '../../components/logout-button';

export default function HomeDiaristaScreen({ navigation }: any) {
  const [aba, setAba] = useState<'agenda' | 'solicitacoes'>(
    'agenda'
  );
  const [proximas, setProximas] = useState<Agendamento[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    agendamentoService
      .listar({ visao: 'futuros', limit: 100 })
      .then((response) => setProximas(response.data))
      .catch((error) =>
        Alert.alert('Não foi possível carregar a agenda', getErrorMessage(error)),
      )
      .finally(() => setLoadingAgenda(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>

        <View style={styles.headerIcons}>
  <TouchableOpacity
    style={styles.headerIconButton}
    onPress={() =>
      navigation.navigate('HistoricoDiarista')
    }
    activeOpacity={0.7}
    accessibilityLabel="Abrir histórico"
  >
    <Ionicons
      name="clipboard-outline"
      size={21}
      color="#FF6B2C"
    />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.profileButton}
    onPress={() =>
      navigation.navigate('PerfilDiaristaEdicao')
    }
    activeOpacity={0.7}
    accessibilityLabel="Abrir perfil"
  >
    <Ionicons
      name="person"
      size={20}
      color="#FF6B2C"
    />
  </TouchableOpacity>

  <LogoutButton navigation={navigation} variant='icon' />
</View>

        <Text style={styles.welcome}>
          Olá, {user?.nome?.split(' ')[0] ?? 'diarista'}!
        </Text>

        <Text style={styles.subtitle}>
          Veja suas oportunidades e agendamentos
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'agenda' && styles.tabActive,
            ]}
            onPress={() => setAba('agenda')}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'agenda' && styles.tabTextActive,
              ]}
            >
              Agenda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'solicitacoes' && styles.tabActive,
            ]}
            onPress={() => {
              setAba('solicitacoes');
              navigation.navigate('SolicitacoesDiarista');
            }}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'solicitacoes' &&
                  styles.tabTextActive,
              ]}
            >
              Solicitações
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {aba === 'agenda' ? (
            <>
              <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color="#777777"
                  />

                  <Text style={styles.calendarMonth}>
                    Maio 2024
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#777777"
                  />
                </View>

                <View style={styles.week}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(
                    (dia, index) => (
                      <Text
                        key={`${dia}-${index}`}
                        style={styles.weekDay}
                      >
                        {dia}
                      </Text>
                    )
                  )}
                </View>

                <View style={styles.days}>
                  {Array.from({ length: 35 }).map(
                    (_, index) => {
                      const numero = index - 2;

                      if (numero <= 0 || numero > 31) {
                        return (
                          <View
                            key={index}
                            style={styles.day}
                          />
                        );
                      }

                      const concluido =
                        numero === 1 || numero === 5;

                      const marcado =
                        numero === 15 || numero === 30;

                      return (
                        <View
                          key={index}
                          style={[
                            styles.day,
                            concluido &&
                              styles.dayCompleted,
                            marcado &&
                              styles.dayScheduled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              (concluido || marcado) &&
                                styles.dayTextSelected,
                            ]}
                          >
                            {numero}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>

                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        styles.completedDot,
                      ]}
                    />

                    <Text style={styles.legendText}>
                      Concluído
                    </Text>
                  </View>

                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        styles.scheduledDot,
                      ]}
                    />

                    <Text style={styles.legendText}>
                      Marcado
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Próximas diárias
              </Text>

              {loadingAgenda && <ActivityIndicator color={'#FF6B2C'} />}
              {!loadingAgenda && proximas.length === 0 && (
                <Text style={styles.smallText}>
                  Nenhuma diária futura encontrada.
                </Text>
              )}
              {proximas.map((agendamento) => (
              <TouchableOpacity
                key={agendamento.id_agendamento}
                style={styles.dailyCard}
                onPress={() =>
                  navigation.navigate('CheckInDiarista', {
                    agendamentoId: agendamento.id_agendamento,
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.clientPhoto}>
                  <Ionicons
                    name="person"
                    size={35}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.dailyInfo}>
                  <Text style={styles.clientName}>
                    {agendamento.cliente?.usuario?.nome ?? 'Cliente'}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Text style={styles.smallText}>
                      Avaliação
                    </Text>

                    <Text style={styles.rating}>
                      5.0
                    </Text>

                    <Ionicons
                      name="star"
                      size={11}
                      color="#FFB800"
                    />
                  </View>

                  <View style={styles.addressRow}>
                    <Ionicons
                      name="search-outline"
                      size={10}
                      color="#999999"
                    />

                    <Text style={styles.address}>
                      {agendamento.endereco
                        ? `${agendamento.endereco.logradouro} ${agendamento.endereco.numero} - ${agendamento.endereco.bairro}`
                        : 'Endereço não informado'}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Ionicons
                      name="calendar-outline"
                      size={10}
                      color="#FFFFFF"
                    />

                    <Text style={styles.statusText}>
                      {agendamento.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#CCCCCC"
              />

              <Text style={styles.emptyTitle}>
                Nenhuma solicitação
              </Text>

              <Text style={styles.emptyText}>
                Suas novas solicitações aparecerão aqui.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
