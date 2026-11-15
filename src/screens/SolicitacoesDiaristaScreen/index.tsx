import { bookingTime, distanceLabel } from '../../utils/appointmentLocation';
import { ResponsiveGrid } from '../../components/responsive-grid';
import { PageHeader } from '../../components/page-header';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';

import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
  foto?: string | null;
  distancia?: number | null;
  avaliacao: string;
  endereco: string;
  data: string;
  horario: string;
  valor: string;
  servicos: string;
  observacoes?: string | null;
};

type Confirmacao = { item: Solicitacao; acao: 'aceitar' | 'recusar' };

export default function SolicitacoesDiaristaScreen({
  navigation,
}: any) {
  const [aba, setAba] = useState<'agenda' | 'solicitacoes'>(
    'solicitacoes'
  );

  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [erroLista, setErroLista] = useState('');
  const [erroListaFechado, setErroListaFechado] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const processing = useRef(false);
  const session = useRef(0);
  const listRequest = useRef(0);
  const { user } = useAuth();

  useEffect(() => {
    session.current++;
    processing.current = false;
    setProcessingId(null);
    setConfirmacao(null);
    setSolicitacoes([]);
    setErroLista(''); setErroAcao(''); setSucesso('');
    carregarSolicitacoes();
    const unsubscribe = navigation.addListener('focus', carregarSolicitacoes);
    return () => { session.current++; listRequest.current++; unsubscribe(); };
  }, [navigation, user?.id_usuario, user?.activeProfile]);

  function apresentarSolicitacao(item: Agendamento): Solicitacao {
    const endereco = item.endereco;
    return {
      id: item.id_agendamento,
      nome: item.cliente?.usuario?.nome ?? 'Cliente',
      foto: item.cliente?.usuario?.foto_perfil,
      distancia: item.distancia_km,
      avaliacao: '-',
      endereco: endereco
        ? `${endereco.logradouro} ${endereco.numero} - ${endereco.bairro}`
        : 'Endereço não informado',
      data: new Date(item.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      horario: bookingTime(item.horario_inicio),
      valor: Number(item.valor_estimado ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      servicos: (item.agendamento_servico ?? [])
        .map((service) => service.diarista_servico?.servico?.nome_servico)
        .filter(Boolean)
        .join(' • ') || 'Serviços não informados',
      observacoes: item.observacoes,
    };
  }

  async function carregarSolicitacoes() {
    const request = ++listRequest.current;
    const currentSession = session.current;
    try {
      setLoading(true);
      const response = await agendamentoService.listar({
        visao: 'solicitacoes',
        limit: 100,
      });
      if (currentSession !== session.current || request !== listRequest.current) return;
      setSolicitacoes(response.data.map(apresentarSolicitacao));
      setErroLista('');
    } catch (error) {
      if (currentSession === session.current && request === listRequest.current) {
        setErroLista(getErrorMessage(error));
        setErroListaFechado(false);
      }
    } finally {
      if (currentSession === session.current && request === listRequest.current) setLoading(false);
    }
  }

  // Só este clique de confirmação chama a API; abrir ou cancelar não altera a solicitação.
  async function responderSolicitacao() {
    if (!confirmacao || processing.current) return;
    const { item, acao } = confirmacao;
    const currentSession = session.current;
    processing.current = true;
    listRequest.current++;
    setProcessingId(item.id);
    setErroAcao('');
    try {
      if (acao === 'aceitar') await agendamentoService.aceitar(item.id);
      else await agendamentoService.recusar(item.id);
      if (currentSession !== session.current) return;
      setSolicitacoes((current) => current.filter((request) => request.id !== item.id));
      setConfirmacao(null);
      setSucesso(acao === 'aceitar'
        ? 'Solicitação aceita! A diária está na sua agenda e o cliente já pode pagar a entrada de 50%.'
        : 'Solicitação recusada. O cliente poderá visualizar a decisão no histórico.');
      await carregarSolicitacoes();
    } catch (error) {
      if (currentSession === session.current) { setConfirmacao(null); setErroAcao(getErrorMessage(error)); }
    } finally {
      if (currentSession === session.current) {
        processing.current = false;
        setProcessingId(null);
        setLoading(false);
      }
    }
  }

  function confirmarAceite(item: Solicitacao) {
    if (processing.current) return;
    setErroAcao(''); setSucesso('');
    setConfirmacao({ item, acao: 'aceitar' });
  }

  function confirmarRecusa(item: Solicitacao) {
    if (processing.current) return;
    setErroAcao(''); setSucesso('');
    setConfirmacao({ item, acao: 'recusar' });
  }

  function irParaAgenda() {
    navigation.navigate('HomeDiarista');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title={`Olá, ${user?.nome?.split(' ')[0] ?? 'diarista'}!`} subtitle="Veja suas oportunidades e agendamentos" accentColor="#FF6B2C" left={<HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />}  />

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


          {Boolean(erroLista) && <View style={styles.confirmationBox}>

            <TouchableOpacity accessibilityRole="button" disabled={loading || processingId !== null} onPress={carregarSolicitacoes}>
              <Text style={styles.retryText}>Tentar carregar novamente</Text>
            </TouchableOpacity>
          </View>}

          {loading ? (
            <ActivityIndicator color={'#FF6B2C'} />
          ) : solicitacoes.length === 0 && !erroLista ? (
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
            <ResponsiveGrid style={styles.list}>
              {solicitacoes.map((solicitacao) => (
                <View
                  key={solicitacao.id}
                  style={styles.requestCard}
                >
                  <View style={styles.requestTop}>
                    <View style={styles.avatar}>
                      {solicitacao.foto && !failedPhotos.includes(solicitacao.foto) ? (
                        <Image source={{ uri: solicitacao.foto }} style={styles.avatarImage} resizeMode="cover"
                          accessibilityLabel={`Foto de ${solicitacao.nome}`}
                          onError={() => setFailedPhotos(current => [...current, solicitacao.foto!])} />
                      ) : (
                        <Ionicons name="person" size={37} color="#FFFFFF" />
                      )}
                    </View>

                    <View style={styles.requestInfo}>
                      <Text style={styles.clientName}>
                        {solicitacao.nome}
                      </Text>

                      <Text style={styles.clientCaption}>Cliente da diária</Text>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="location-outline"
                          size={16}
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
                    <View style={styles.detailRow}><Ionicons name="time-outline" size={18} color="#FF6B2C" /><Text style={styles.detailText}>Início: {solicitacao.horario}</Text></View>
                    <View style={styles.detailRow}><Ionicons name="sparkles-outline" size={15} color="#FF6B2C" /><Text style={styles.detailText}>{solicitacao.servicos}</Text></View>
                    <View style={styles.detailRow}><Ionicons name="cash-outline" size={15} color="#FF6B2C" /><Text style={styles.detailValue}>{solicitacao.valor}</Text></View>
                    {solicitacao.observacoes ? <View style={styles.detailRow}><Ionicons name="chatbubble-outline" size={15} color="#FF6B2C" /><Text style={styles.detailText}>{solicitacao.observacoes}</Text></View> : null}
                  </View>

                  <View style={styles.distanceRow}>
                    <Ionicons name="navigate-outline" size={18} color="#E55318" />
                    <Text style={styles.distanceText}>{distanceLabel(solicitacao.distancia)}</Text>
                  </View>
                  <Text style={styles.distanceHint}>Entre seu endereço e o CEP da casa · linha reta</Text>
                  <TouchableOpacity style={styles.detailsButton} accessibilityRole="button"
                    accessibilityLabel={`Ver detalhes da diária de ${solicitacao.nome}`}
                    onPress={() => navigation.navigate('DetalhesDiaria', { agendamentoId: solicitacao.id })}>
                    <Ionicons name="reader-outline" size={20} color="#E55318" />
                    <Text style={styles.detailsButtonText}>Ver detalhes e localização</Text>
                    <Ionicons name="chevron-forward" size={19} color="#E55318" />
                  </TouchableOpacity>
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
            </ResponsiveGrid>
          )}
        </ScrollView>
      </View>
      <ActionModal visible={Boolean((erroLista && !erroListaFechado) || erroAcao)} variant="error" title="Não foi possível concluir" message={erroAcao || erroLista}
        onClose={() => { setErroListaFechado(true); setErroAcao(''); }} accentColor="#FF6B2C" />
      <ActionModal visible={Boolean(sucesso) && !erroLista && !erroAcao} variant="success" title="Solicitação atualizada" message={sucesso}
        onClose={() => setSucesso('')} accentColor="#FF6B2C" />
      <ActionModal visible={Boolean(confirmacao) && !erroLista && !erroAcao && !sucesso} variant="confirm" accentColor="#FF6B2C"
        title={confirmacao?.acao === 'aceitar' ? 'Aceitar solicitação?' : 'Recusar solicitação?'}
        message={confirmacao ? `${confirmacao.item.nome} • ${confirmacao.item.data} às ${confirmacao.item.horario}. ${confirmacao.acao === 'aceitar' ? 'A diária entrará na sua agenda e o cliente poderá pagar a entrada de 50%.' : 'O cliente será informado da recusa pelo histórico.'}` : ''}
        confirmLabel={confirmacao?.acao === 'aceitar' ? 'Sim, aceitar' : 'Sim, recusar'} cancelLabel="Voltar" busy={processingId !== null}
        onConfirm={responderSolicitacao} onClose={() => { if (!processing.current) { setConfirmacao(null); setErroAcao(''); } }} />
    </SafeAreaView>
  );
}
