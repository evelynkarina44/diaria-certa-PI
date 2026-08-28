import React, { useEffect, useRef, useState } from 'react';

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
import { HeaderMenu } from '../../components/header-menu';
import { diaristaService } from '../../services/diaristaService';

const scheduledStatuses: Agendamento['status'][] = ['Aceito', 'Em_andamento'];
const futureStatuses: Agendamento['status'][] = ['Aceito', 'Em_andamento'];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function appointmentDateKey(value: string) {
  return value.slice(0, 10);
}

function monthTitle(date: Date) {
  const title = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export default function HomeDiaristaScreen({ navigation }: any) {
  const [aba, setAba] = useState<'agenda' | 'solicitacoes'>(
    'agenda'
  );
  const [proximas, setProximas] = useState<Agendamento[]>([]);
  const [agenda, setAgenda] = useState<Agendamento[]>([]);
  const [mesExibido, setMesExibido] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const { user } = useAuth();
  const agendaReminderShown = useRef(false);

  useEffect(() => {
    const diaristaId = user?.diarista?.[0]?.id_diarista;
    if (!diaristaId || agendaReminderShown.current) return;
    diaristaService.buscarPorId(diaristaId).then((profile) => {
      if (agendaReminderShown.current || (profile.disponibilidade_diarista ?? []).length) return;
      agendaReminderShown.current = true;
      Alert.alert(
        'Cadastre sua agenda',
        'Para receber solicitações, informe os dias e horários em que você está disponível.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Cadastrar agenda', onPress: () => navigation.navigate('AgendaDiarista') },
        ],
      );
    }).catch(() => undefined);
  }, [navigation, user?.diarista]);

  useEffect(() => {
    async function carregarAgenda() {
      setLoadingAgenda(true);
      try {
        const firstPage = await agendamentoService.listar({ visao: 'todos', page: 1, limit: 100 });
        const remainingPages = firstPage.pagination.pages > 1
          ? await Promise.all(
              Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
                agendamentoService.listar({ visao: 'todos', page: index + 2, limit: 100 }),
              ),
            )
          : [];
        const appointments = [firstPage, ...remainingPages].flatMap((response) => response.data);
        const today = localDateKey(new Date());
        const upcoming = appointments
          .filter((item) => appointmentDateKey(item.data_agendamento) >= today && futureStatuses.includes(item.status))
          .sort((a, b) => {
            const dateComparison = appointmentDateKey(a.data_agendamento).localeCompare(appointmentDateKey(b.data_agendamento));
            return dateComparison || (a.horario_inicio ?? '').localeCompare(b.horario_inicio ?? '');
          });

        setAgenda(appointments);
        setProximas(upcoming);
      } catch (error) {
        Alert.alert('Não foi possível carregar a agenda', getErrorMessage(error));
      } finally {
        setLoadingAgenda(false);
      }
    }

    carregarAgenda();
    const unsubscribe = navigation.addListener('focus', carregarAgenda);
    return unsubscribe;
  }, [navigation]);

  const anoExibido = mesExibido.getFullYear();
  const numeroMesExibido = mesExibido.getMonth();
  const primeiroDiaSemana = new Date(anoExibido, numeroMesExibido, 1).getDay();
  const quantidadeDias = new Date(anoExibido, numeroMesExibido + 1, 0).getDate();
  const quantidadeCelulas = Math.ceil((primeiroDiaSemana + quantidadeDias) / 7) * 7;
  const todayKey = localDateKey(new Date());

  function alterarMes(offset: number) {
    setMesExibido((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>

        <View style={styles.headerIcons}>
          <HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />
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
                  <TouchableOpacity
                    style={styles.calendarArrow}
                    onPress={() => alterarMes(-1)}
                    accessibilityLabel="Exibir mês anterior"
                  >
                    <Ionicons name="chevron-back" size={20} color="#777777" />
                  </TouchableOpacity>

                  <Text style={styles.calendarMonth}>
                    {monthTitle(mesExibido)}
                  </Text>

                  <TouchableOpacity
                    style={styles.calendarArrow}
                    onPress={() => alterarMes(1)}
                    accessibilityLabel="Exibir próximo mês"
                  >
                    <Ionicons name="chevron-forward" size={20} color="#777777" />
                  </TouchableOpacity>
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
                  {Array.from({ length: quantidadeCelulas }).map(
                    (_, index) => {
                      const numero = index - primeiroDiaSemana + 1;

                      if (numero <= 0 || numero > quantidadeDias) {
                        return (
                          <View
                            key={index}
                            style={styles.day}
                          />
                        );
                      }

                      const dateKey = localDateKey(new Date(anoExibido, numeroMesExibido, numero));
                      const appointments = agenda.filter((item) => appointmentDateKey(item.data_agendamento) === dateKey);
                      const marcado = appointments.some((item) => scheduledStatuses.includes(item.status));
                      const concluido = !marcado && appointments.some((item) => item.status === 'Concluido');
                      const hoje = dateKey === todayKey;

                      return (
                        <View
                          key={dateKey}
                          style={[
                            styles.day,
                            hoje && styles.dayToday,
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
