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
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';
import { HeaderMenu } from '../../components/header-menu';
import { useAuth } from '../../contexts/GlobalContext';

type Solicitacao = {
  id: number;
  nome: string;
  avaliacao: string;
  endereco: string;
  data: string;
  horario: string;
  valor: string;
  servicos: string;
  observacoes?: string | null;
};

export default function SolicitacoesDiaristaScreen({
  navigation,
}: any) {
  const [aba, setAba] = useState<'agenda' | 'solicitacoes'>(
    'solicitacoes'
  );

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    carregarSolicitacoes();
    const unsubscribe = navigation.addListener('focus', carregarSolicitacoes);
    return unsubscribe;
  }, [navigation]);

  function apresentarSolicitacao(item: Agendamento): Solicitacao {
    const endereco = item.endereco;
    return {
      id: item.id_agendamento,
      nome: item.cliente?.usuario?.nome ?? 'Cliente',
      avaliacao: '-',
      endereco: endereco
        ? `${endereco.logradouro} ${endereco.numero} - ${endereco.bairro}`
        : 'Endereço não informado',
      data: new Date(item.data_agendamento).toLocaleDateString('pt-BR'),
      horario: item.horario_inicio
        ? new Date(item.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
        : 'Horário não informado',
      valor: Number(item.valor_estimado ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      servicos: (item.agendamento_servico ?? [])
        .map((service) => service.diarista_servico?.servico?.nome_servico)
        .filter(Boolean)
        .join(' • ') || 'Serviços não informados',
      observacoes: item.observacoes,
    };
  }

  async function carregarSolicitacoes() {
    try {
      setLoading(true);
      const response = await agendamentoService.listar({
        visao: 'solicitacoes',
        limit: 100,
      });
      setSolicitacoes(response.data.map(apresentarSolicitacao));
    } catch (error) {
      Alert.alert(
        'Não foi possível carregar as solicitações',
        getErrorMessage(error),
      );
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }

  async function aceitarSolicitacao(id: number) {
    try {
      setProcessingId(id);
      await agendamentoService.aceitar(id);
      await carregarSolicitacoes();
      Alert.alert(
        'Solicitação aceita',
        'A diária foi adicionada à sua agenda.',
      );
    } catch (error) {
      Alert.alert('Não foi possível aceitar', getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  async function negarSolicitacao(id: number) {
    try {
      setProcessingId(id);
      await agendamentoService.recusar(id);
      await carregarSolicitacoes();
      Alert.alert('Solicitação recusada', 'O cliente poderá visualizar a decisão no histórico.');
    } catch (error) {
      Alert.alert('Não foi possível recusar', getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  function confirmarAceite(item: Solicitacao) {
    Alert.alert('Aceitar solicitação?', `${item.nome} • ${item.data} às ${item.horario}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceitar', onPress: () => aceitarSolicitacao(item.id) },
    ]);
  }

  function confirmarRecusa(item: Solicitacao) {
    Alert.alert('Recusar solicitação?', 'O agendamento será marcado como recusado para o cliente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Recusar', style: 'destructive', onPress: () => negarSolicitacao(item.id) },
    ]);
  }

  function irParaAgenda() {
    navigation.navigate('HomeDiarista');
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
            onPress={() => {
              setAba('agenda');
              irParaAgenda();
            }}
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
            onPress={() => setAba('solicitacoes')}
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
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Solicitações disponíveis
          </Text>

          {loading ? (
            <ActivityIndicator color={'#FF6B2C'} />
          ) : solicitacoes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle-outline"
                size={50}
                color="#CCCCCC"
              />

              <Text style={styles.emptyTitle}>
                Nenhuma solicitação pendente
              </Text>

              <Text style={styles.emptyText}>
                Novas oportunidades aparecerão aqui.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {solicitacoes.map((solicitacao) => (
                <View
                  key={solicitacao.id}
                  style={styles.requestCard}
                >
                  <View style={styles.requestTop}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={37}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.requestInfo}>
                      <Text style={styles.clientName}>
                        {solicitacao.nome}
                      </Text>

                      <View style={styles.ratingRow}>
                        <Text style={styles.smallLabel}>
                          Avaliação
                        </Text>

                        <Text style={styles.rating}>
                          {solicitacao.avaliacao}
                        </Text>

                        <Ionicons
                          name="star"
                          size={11}
                          color="#FFB800"
                        />
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="search-outline"
                          size={10}
                          color="#999999"
                        />

                        <Text style={styles.infoText}>
                          {solicitacao.endereco}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={11}
                          color="#777777"
                        />

                        <Text style={styles.dateText}>
                          {solicitacao.data}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}><Ionicons name="time-outline" size={15} color="#FF6B2C" /><Text style={styles.detailText}>Início: {solicitacao.horario}</Text></View>
                    <View style={styles.detailRow}><Ionicons name="sparkles-outline" size={15} color="#FF6B2C" /><Text style={styles.detailText}>{solicitacao.servicos}</Text></View>
                    <View style={styles.detailRow}><Ionicons name="cash-outline" size={15} color="#FF6B2C" /><Text style={styles.detailValue}>{solicitacao.valor}</Text></View>
                    {solicitacao.observacoes ? <View style={styles.detailRow}><Ionicons name="chatbubble-outline" size={15} color="#FF6B2C" /><Text style={styles.detailText}>{solicitacao.observacoes}</Text></View> : null}
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.rejectButton, processingId === solicitacao.id && styles.disabled]}
                      onPress={() => confirmarRecusa(solicitacao)}
                      disabled={processingId !== null}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectText}>
                        Negar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.acceptButton, processingId === solicitacao.id && styles.disabled]}
                      onPress={() => confirmarAceite(solicitacao)}
                      disabled={processingId !== null}
                      activeOpacity={0.8}
                    >
                      {processingId === solicitacao.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.acceptText}>Aceitar</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
