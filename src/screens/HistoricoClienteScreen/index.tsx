import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { filterHistory, paginateHistory } from '../../utils/historyFilters';
import { formatDate } from '../../utils/inputMasks';
import { agendamentoService } from '../../services/agendamentoService';
import { favoritoService } from '../../services/favoritoService';
import { getErrorMessage } from '../../services/api';
import type {
  Agendamento,
  Diarista as ApiDiarista,
  Favorito,
} from '../../services/types';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
  respostaRapida?: boolean;
  diaristaId?: number;
  favoritoId?: number;
  data?: string;
  dataISO?: string;
  horario?: string;
  servicos?: string;
  valor?: number | null;
  foto?: string | null;
  status?: Agendamento['status'];
  checkinSolicitado?: boolean;
  checkinExpirado?: boolean;
};

const statusLabels: Record<Agendamento['status'], string> = {
  Pendente: 'Pendente',
  Aceito: 'Aceito',
  Recusado: 'Recusado',
  Cancelado: 'Cancelado',
  Expirado: 'Expirado',
  Em_andamento: 'Em andamento',
  Concluido: 'Concluído',
};

const statusColors: Record<Agendamento['status'], string> = {
  Pendente: '#B54708',
  Aceito: '#008A99',
  Recusado: '#D92D20',
  Cancelado: '#D92D20',
  Expirado: '#777777',
  Em_andamento: '#1570EF',
  Concluido: '#00A817',
};

const statusIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Todos: 'layers-outline', Pendente: 'hourglass-outline', Aceito: 'checkmark-circle-outline',
  Em_andamento: 'sparkles-outline', Concluido: 'checkmark-done-circle-outline',
  Recusado: 'close-circle-outline', Cancelado: 'ban-outline', Expirado: 'timer-outline',
  Checkin_expirado: 'alarm-outline',
};
const statusFilters = [
  ['Todos', 'Todos'], ['Pendente', 'Pendentes'], ['Aceito', 'Aceitos'],
  ['Em_andamento', 'Em andamento'], ['Concluido', 'Concluídos'],
  ['Recusado', 'Recusados'], ['Cancelado', 'Cancelados'], ['Expirado', 'Expirados'],
  ['Checkin_expirado', 'Check-in expirado'],
];

export default function HistoricoClienteScreen({
  navigation,
  route,
}: any) {
  const exibirFavoritos = route?.name === 'FavoritosCliente';

  const [historico, setHistorico] = useState<Diarista[]>([]);
  const [favoritos, setFavoritos] = useState<Diarista[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroHistorico, setErroHistorico] = useState('');
  const [erroFavoritos, setErroFavoritos] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [paginaBusca, setPaginaBusca] = useState({ chave: '', pagina: 1 });
  const [ordem, setOrdem] = useState<'recentes' | 'antigos'>('recentes');
  const [fotosComErro, setFotosComErro] = useState<number[]>([]);
  const historicoFiltrado = filterHistory(historico, busca, statusFiltro, dataFiltro, ordem);
  // Filtrar e ordenar antes de paginar evita esconder resultados de outras páginas.
  const chavePagina = JSON.stringify([busca, statusFiltro, dataFiltro, ordem]);
  useEffect(() => {
    setPaginaBusca(current => current.chave === chavePagina ? current : { chave: chavePagina, pagina: 1 });
  }, [chavePagina]);
  const paginaSolicitada = paginaBusca.chave === chavePagina ? paginaBusca.pagina : 1;
  const paginaHistorico = paginateHistory(historicoFiltrado, paginaSolicitada);
  function mudarPagina(pagina: number) {
    if (loading || pagina < 1 || pagina > paginaHistorico.pages) return;
    setPaginaBusca({ chave: chavePagina, pagina });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }
  const temFiltros = Boolean(busca || dataFiltro || statusFiltro !== 'Todos');
  function limparFiltros() { setBusca(''); setDataFiltro(''); setStatusFiltro('Todos'); }

  useEffect(() => {
    carregarDados();
    const unsubscribe = navigation.addListener('focus', carregarDados);
    return unsubscribe;
  }, [navigation]);

  function apresentarPerfil(
    profile: ApiDiarista,
    favorito?: Favorito,
  ): Diarista {
    const endereco = profile.endereco?.[0];
    return {
      id: favorito?.id_favorito ?? profile.id_diarista,
      diaristaId: profile.id_diarista,
      nome: profile.usuario?.nome ?? 'Diarista',
      avaliacao: Number(profile.avaliacao_media ?? 0).toFixed(1),
      quantidadeAvaliacoes: String(profile.avaliacao?.length ?? 0),
      distancia: endereco
        ? `${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`
        : 'Localização não informada',
      favorito: Boolean(favorito),
      respostaRapida: profile.responde_rapido === true,
      favoritoId: favorito?.id_favorito,
    };
  }

  function apresentarHistorico(
    appointment: Agendamento,
    favorites: Favorito[],
  ): Diarista {
    const profile = appointment.diarista;
    const favorite = favorites.find(
      (item) => item.id_diarista === appointment.id_diarista,
    );
    return {
      id: appointment.id_agendamento,
      diaristaId: appointment.id_diarista,
      nome: profile?.usuario?.nome ?? 'Diarista',
      avaliacao: Number(profile?.avaliacao_media ?? 0).toFixed(1),
      quantidadeAvaliacoes: '0',
      distancia: appointment.endereco
        ? `${appointment.endereco.bairro}, ${appointment.endereco.cidade}`
        : 'Localização não informada',
      favorito: Boolean(favorite),
      favoritoId: favorite?.id_favorito,
      dataISO: appointment.data_agendamento,
      horario: appointment.horario_inicio?.includes('T')
        ? appointment.horario_inicio.slice(11, 16)
        : appointment.horario_inicio?.slice(0, 5),
      servicos: appointment.agendamento_servico?.map(item => item.diarista_servico?.servico?.nome_servico).filter(Boolean).join(' • '),
      valor: appointment.valor_estimado,
      foto: profile?.usuario?.foto_perfil,
      data: new Date(appointment.data_agendamento).toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' },
      ),
      status: appointment.checkin_expirado ? 'Expirado' : appointment.status,
      checkinExpirado: appointment.checkin_expirado,
      checkinSolicitado: appointment.checkin_checkout?.some((item) => ['Checkin_solicitado', 'Aguardando_pagamento'].includes(item.status_checkin)),
    };
  }

  async function carregarDados() {
    setLoading(true);
    const [appointmentsResult, favoritesResult] = await Promise.allSettled([
      (async () => {
        // Os filtros consideram todo o histórico, não só os primeiros 100 registros.
        const first = await agendamentoService.listar({ visao: 'todos', limit: 100 });
        const data = [...first.data];
        for (let page = 2; page <= first.pagination.pages; page++) {
          const response = await agendamentoService.listar({ visao: 'todos', limit: 100, page });
          data.push(...response.data);
        }
        return { ...first, data };
      })(),
      favoritoService.listar({ limit: 100 }),
    ]);

    const favorites = favoritesResult.status === 'fulfilled'
      ? favoritesResult.value.data
      : [];

    if (appointmentsResult.status === 'fulfilled') {
      setHistorico(
        appointmentsResult.value.data.map((item) =>
          apresentarHistorico(item, favorites),
        ),
      );
      setErroHistorico('');
    } else {
      setHistorico([]);
      setErroHistorico(getErrorMessage(appointmentsResult.reason));
    }

    if (favoritesResult.status === 'fulfilled') {
      setFavoritos(
        favorites
          .filter((item) => item.diarista)
          .map((item) => apresentarPerfil(item.diarista!, item)),
      );
      setErroFavoritos('');
    } else {
      setFavoritos([]);
      setErroFavoritos(getErrorMessage(favoritesResult.reason));
    }

    setLoading(false);
  }

  async function alternarFavorito(item: Diarista) {
    if (!item.diaristaId) return;
    try {
      if (item.favoritoId) {
        await favoritoService.remover(item.favoritoId);
      } else {
        await favoritoService.criar(item.diaristaId);
      }
      await carregarDados();
    } catch (error) {
      Alert.alert('Não foi possível atualizar', getErrorMessage(error));
    }
  }

  function abrirPerfil(diarista: Diarista) {
    navigation.navigate('PerfilDiarista', {
      diaristaId: diarista.diaristaId,
    });
  }

  function renderCard(diarista: Diarista) {
    return (
      <View
        key={diarista.id}
        style={styles.card}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => abrirPerfil(diarista)}
          activeOpacity={0.85}
        >
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={36}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>
              {diarista.nome}
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                {diarista.avaliacao}
              </Text>

              <Ionicons
                name="star"
                size={12}
                color="#FFB800"
              />

              <Text style={styles.reviewCount}>
                ({diarista.quantidadeAvaliacoes})
              </Text>
            </View>

            <Text style={styles.distance}>
              {diarista.distancia}
            </Text>

            {diarista.status ? <View style={[styles.quickBadge, { backgroundColor: statusColors[diarista.status] }]}>
              <Ionicons
                name={diarista.status === 'Concluido' ? 'checkmark-circle-outline' : 'time-outline'}
                size={12}
                color="#FFFFFF"
              />

              <Text style={[styles.quickText, styles.statusText]}>
                {diarista.checkinExpirado ? 'Check-in expirado' : statusLabels[diarista.status]}
              </Text>
            </View> : diarista.respostaRapida ? <View style={styles.quickBadge}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#18C7C8" />
              <Text style={styles.quickText}>Responde rápido</Text>
            </View> : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => alternarFavorito(diarista)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              diarista.favorito
                ? 'heart'
                : 'heart-outline'
            }
            size={21}
            color={
              diarista.favorito
                ? '#E0001B'
                : '#AAAAAA'
            }
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderHistoryCard(item: Diarista) {
    const status = item.status ?? 'Pendente';
    const color = statusColors[status];
    return (
      <View key={item.id} style={styles.historyCard}>
        <View style={styles.historyCardTop}>
          <Text style={styles.bookingNumber}>DIÁRIA #{item.id}</Text>
          <View style={[styles.historyStatus, { backgroundColor: color + '14' }]}>
            <Ionicons name={statusIcons[item.checkinExpirado ? 'Checkin_expirado' : status]} size={15} color={color} />
            <Text style={[styles.historyStatusText, { color }]}>{item.checkinExpirado ? 'Check-in expirado' : statusLabels[status]}</Text>
          </View>
        </View>
        <View style={styles.historyProfileRow}>
          <TouchableOpacity style={styles.historyProfile} onPress={() => abrirPerfil(item)} accessibilityRole="button" accessibilityLabel={`Ver perfil de ${item.nome}`}>
            <View style={styles.historyAvatar}>
              {item.foto && !fotosComErro.includes(item.id) ? <Image source={{ uri: item.foto }} style={styles.historyPhoto} onError={() => setFotosComErro(current => [...current, item.id])} />
                : <Ionicons name="person-outline" size={27} color="#008A99" />}
            </View>
            <View style={styles.info}>
              <Text style={styles.historyName}>{item.nome}</Text>
              <Text style={styles.profileLink}>Ver perfil da profissional <Ionicons name="chevron-forward" size={11} /></Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.historyDetails}>
          <View style={styles.detailRow}><Ionicons name="calendar-outline" size={17} color="#008A99" /><Text style={styles.detailText}>{item.data}</Text></View>
          <View style={styles.detailRow}><Ionicons name="time-outline" size={17} color="#008A99" /><Text style={styles.detailText}>{item.horario ? `Início às ${item.horario}` : 'Horário não informado'}</Text></View>
          <View style={styles.detailRow}><Ionicons name="location-outline" size={17} color="#008A99" /><Text style={styles.detailText}>{item.distancia}</Text></View>
          {Boolean(item.servicos) && <View style={styles.detailRow}><Ionicons name="sparkles-outline" size={17} color="#008A99" /><Text style={styles.detailText}>{item.servicos}</Text></View>}
        </View>
        <View style={styles.historyFooter}>
          <View><Text style={styles.totalLabel}>Valor da diária</Text><Text style={styles.totalValue}>{item.valor == null ? 'Não informado' : Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></View>
          <TouchableOpacity style={styles.paymentButton} accessibilityRole="button" onPress={() => navigation.push('Pagamento', { agendamentoId: item.id, dataAgendamento: item.data })}>
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" /><Text style={styles.paymentText}>Pagamento</Text><Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {status === 'Aceito' && item.checkinSolicitado && <TouchableOpacity style={styles.checkinButton} onPress={() => navigation.navigate('CheckIn', { agendamentoId: item.id })}>
          <Ionicons name="log-in-outline" size={19} color="#008A99" /><Text style={styles.checkinText}>Confirmar check-in</Text>
        </TouchableOpacity>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, !exibirFavoritos && styles.historyHeaderTitle]}>
          {exibirFavoritos ? 'Favoritos' : 'Histórico'}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, !exibirFavoritos && styles.historyContainer]}
          showsVerticalScrollIndicator={false}
        >
          {loading && <ActivityIndicator color={'#18C7C8'} />}
          {!exibirFavoritos && (
            <View style={styles.historyToolbar}>
              <View style={styles.historySearch}>
                <Ionicons name="search-outline" size={20} color="#667085" />
                <TextInput style={styles.historyInput} placeholder="Buscar nome, serviço ou nº da diária" placeholderTextColor="#98A2B3" accessibilityLabel="Buscar no histórico" value={busca} onChangeText={setBusca} />
                {Boolean(busca) && <TouchableOpacity accessibilityLabel="Limpar busca" onPress={() => setBusca('')}><Ionicons name="close-circle" size={20} color="#98A2B3" /></TouchableOpacity>}
              </View>
              <Text style={styles.filterLabel}>Status do agendamento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterList}>
                {statusFilters.map(([value, label]) => (
                  <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: statusFiltro === value }} onPress={() => setStatusFiltro(value)} style={[styles.statusChip, statusFiltro === value && styles.statusChipSelected]}>
                    <Ionicons name={statusIcons[value]} size={16} color={statusFiltro === value ? '#FFFFFF' : '#667085'} />
                    <Text style={[styles.statusChipText, statusFiltro === value && styles.statusChipTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.filterLabel}>Data da diária</Text>
              <View style={styles.historySearch}>
                <Ionicons name="calendar-outline" size={20} color="#667085" />
                <TextInput style={styles.historyInput} placeholder="dd/mm/aaaa" placeholderTextColor="#98A2B3" accessibilityLabel="Filtrar por data da diária" keyboardType="number-pad" maxLength={10} value={dataFiltro} onChangeText={value => setDataFiltro(formatDate(value))} />
                {Boolean(dataFiltro) && <TouchableOpacity accessibilityLabel="Limpar data" onPress={() => setDataFiltro('')}><Ionicons name="close-circle" size={20} color="#98A2B3" /></TouchableOpacity>}
              </View>
              <Text style={styles.dateHint}>Você também pode digitar só o dia ou dia/mês.</Text>
              <View style={styles.resultsRow}>
                <Text style={styles.resultCount}>{loading ? 'Atualizando...' : `${historicoFiltrado.length} ${historicoFiltrado.length === 1 ? 'diária encontrada' : 'diárias encontradas'}`}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar agendamentos"
                  accessibilityState={{ disabled: loading, busy: loading }}
                  disabled={loading} onPress={carregarDados}
                  style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}>
                  {loading ? <ActivityIndicator size="small" color="#008A99" /> : <Ionicons name="refresh-outline" size={18} color="#008A99" />}
                  <Text style={styles.refreshText}>{loading ? 'Atualizando' : 'Atualizar'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sortRow}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Alterar ordenação" style={styles.sortButton} onPress={() => setOrdem(current => current === 'recentes' ? 'antigos' : 'recentes')}>
                  <Ionicons name="swap-vertical-outline" size={16} color="#008A99" /><Text style={styles.sortText}>{ordem === 'recentes' ? 'Mais recentes' : 'Mais antigas'}</Text>
                </TouchableOpacity>
              </View>
              {temFiltros && <TouchableOpacity style={styles.resetFilters} onPress={limparFiltros}><Ionicons name="close-outline" size={17} color="#008A99" /><Text style={styles.sortText}>Limpar filtros</Text></TouchableOpacity>}
            </View>
          )}
          {!exibirFavoritos ? (
            <>
              {Boolean(erroHistorico) && <Text style={styles.emptyText}>{erroHistorico}</Text>}
              {!loading && !erroHistorico && paginaHistorico.data.map(renderHistoryCard)}
              {!loading && !erroHistorico && paginaHistorico.pages > 1 && (
                <View style={styles.paginationActions}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Página anterior"
                    accessibilityState={{ disabled: paginaHistorico.page <= 1 }}
                    disabled={paginaHistorico.page <= 1}
                    style={[styles.pageButton, paginaHistorico.page <= 1 && styles.pageButtonDisabled]}
                    onPress={() => mudarPagina(paginaHistorico.page - 1)}>
                    <Ionicons name="chevron-back" size={18} color="#008A99" /><Text style={styles.pageButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <Text accessibilityLiveRegion="polite" style={styles.pageNumber}>Página {paginaHistorico.page} de {paginaHistorico.pages}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próxima página"
                    accessibilityState={{ disabled: paginaHistorico.page >= paginaHistorico.pages }}
                    disabled={paginaHistorico.page >= paginaHistorico.pages}
                    style={[styles.pageButton, paginaHistorico.page >= paginaHistorico.pages && styles.pageButtonDisabled]}
                    onPress={() => mudarPagina(paginaHistorico.page + 1)}>
                    <Text style={styles.pageButtonText}>Próxima</Text><Ionicons name="chevron-forward" size={18} color="#008A99" />
                  </TouchableOpacity>
                </View>
              )}
              {!loading && !erroHistorico && historicoFiltrado.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyTitle}>{temFiltros ? 'Nenhuma diária com esses filtros' : 'Nenhum agendamento encontrado'}</Text>
                  <Text style={styles.emptyText}>{temFiltros ? 'Tente outro nome, status ou data.' : 'Seus agendamentos aparecerão aqui.'}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.favoriteTitle}>
                Confira a sua lista de favoritos
              </Text>

              <View style={styles.favoritesList}>
                {favoritos.map((item) => renderCard(item))}
              </View>

              {Boolean(erroFavoritos) && <Text style={styles.emptyText}>{erroFavoritos}</Text>}

              {!loading && !erroFavoritos && favoritos.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="heart-outline"
                    size={50}
                    color="#CCCCCC"
                  />

                  <Text style={styles.emptyTitle}>
                    Nenhuma diarista favorita
                  </Text>

                  <Text style={styles.emptyText}>
                    Toque no coração das profissionais que você
                    deseja salvar.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
