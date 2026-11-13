import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { ActionModal } from '../../components/action-modal';
import { agendamentoService } from '../../services/agendamentoService';
import { getErrorMessage } from '../../services/api';
import { filterHistory, paginateHistory } from '../../utils/historyFilters';
import { formatDate } from '../../utils/inputMasks';
import type { Agendamento } from '../../services/types';

type RegistroHistorico = {
  id: number;
  nome: string;
  avaliacao: NonNullable<Agendamento['avaliacao']>[number] | null;
  endereco: string;
  status: Agendamento['status'];
  checkinExpirado?: boolean;
  data: string;
  dataISO: string;
  horario?: string;
  servicos: string;
  valor?: number | null;
  foto?: string | null;
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
  Aceito: '#C2410C',
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


export default function HistoricoDiaristaScreen({ navigation }: any) {
  const [historicoReal, setHistoricoReal] = useState<RegistroHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const [ordem, setOrdem] = useState<'recentes' | 'antigos'>('recentes');
  const [fotosComErro, setFotosComErro] = useState<number[]>([]);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [paginaBusca, setPaginaBusca] = useState({ chave: '', pagina: 1 });
  const historicoFiltrado = filterHistory(historicoReal, busca, statusFiltro, dataFiltro, ordem);
  const chavePagina = JSON.stringify([busca, statusFiltro, dataFiltro, ordem]);
  useEffect(() => {
    setPaginaBusca(current => current.chave === chavePagina ? current : { chave: chavePagina, pagina: 1 });
  }, [chavePagina]);
  const paginaSolicitada = paginaBusca.chave === chavePagina ? paginaBusca.pagina : 1;
  const paginaHistorico = paginateHistory(historicoFiltrado, paginaSolicitada);
  const temFiltros = Boolean(busca || dataFiltro || statusFiltro !== 'Todos');
  function limparFiltros() { setBusca(''); setDataFiltro(''); setStatusFiltro('Todos'); }
  function mudarPagina(pagina: number) {
    if (loading || pagina < 1 || pagina > paginaHistorico.pages) return;
    setPaginaBusca({ chave: chavePagina, pagina });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function apresentarHistorico(item: Agendamento): RegistroHistorico {
    const endereco = item.endereco;
    return {
      id: item.id_agendamento,
      nome: item.cliente?.usuario?.nome ?? 'Cliente',
      avaliacao: item.avaliacao?.find(review => review.autor_tipo === 'Cliente') ?? null,
      endereco: endereco ? `${endereco.logradouro} ${endereco.numero} - ${endereco.bairro}` : 'Endereço não informado',
      status: item.checkin_expirado ? 'Expirado' : item.status,
      checkinExpirado: item.checkin_expirado,
      dataISO: item.data_agendamento,
      data: new Date(item.data_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }),
      horario: item.horario_inicio?.includes('T') ? item.horario_inicio.slice(11, 16) : item.horario_inicio?.slice(0, 5),
      servicos: item.agendamento_servico?.map(service => service.diarista_servico?.servico?.nome_servico).filter(Boolean).join(' • ') ?? '',
      valor: item.valor_estimado,
      foto: item.cliente?.usuario?.foto_perfil,
    };
  }

  useEffect(() => {
    let active = true;
    let requestId = 0;
    async function carregarHistorico() {
      const id = ++requestId;
      setLoading(true);
      setError('');
      try {
        // Os filtros consideram todas as diárias antes da paginação visual de 10 itens.
        const first = await agendamentoService.listar({ visao: 'todos', limit: 100 });
        const data = [...first.data];
        for (let page = 2; page <= first.pagination.pages; page++) {
          const response = await agendamentoService.listar({ visao: 'todos', limit: 100, page });
          if (!active || id !== requestId) return;
          data.push(...response.data);
        }
        if (active && id === requestId) setHistoricoReal(data.map(apresentarHistorico));
      } catch (cause) {
        if (active && id === requestId) {
          setError(getErrorMessage(cause));
          setErrorModalVisible(true);
        }
      } finally {
        if (active && id === requestId) setLoading(false);
      }
    }
    carregarHistorico();
    const unsubscribe = navigation.addListener('focus', carregarHistorico);
    return () => { active = false; unsubscribe(); };
  }, [navigation, refreshKey]);

  function renderCard(registro: RegistroHistorico) {
    const color = statusColors[registro.status];
    return (
      <View key={registro.id} style={styles.historyCard}>
        <View style={styles.historyCardTop}>
          <Text style={styles.bookingNumber}>DIÁRIA #{registro.id}</Text>
          <View style={[styles.historyStatus, { backgroundColor: color + '14' }]}>
            <Ionicons name={statusIcons[registro.checkinExpirado ? 'Checkin_expirado' : registro.status]} size={15} color={color} />
            <Text style={[styles.historyStatusText, { color }]}>{registro.checkinExpirado ? 'Check-in expirado' : statusLabels[registro.status]}</Text>
          </View>
        </View>
        <View style={styles.historyProfileRow}>
          <View style={styles.historyAvatar}>
            {registro.foto && !fotosComErro.includes(registro.id)
              ? <Image source={{ uri: registro.foto }} style={styles.historyPhoto} onError={() => setFotosComErro(current => [...current, registro.id])} />
              : <Ionicons name="person-outline" size={27} color="#C2410C" />}
          </View>
          <View style={styles.info}><Text style={styles.historyName}>{registro.nome}</Text><Text style={styles.profileLink}>Cliente da diária</Text></View>
        </View>
        <View style={styles.historyDetails}>
          <View style={styles.detailRow}><Ionicons name="calendar-outline" size={17} color="#C2410C" /><Text style={styles.detailText}>{registro.data}</Text></View>
          <View style={styles.detailRow}><Ionicons name="time-outline" size={17} color="#C2410C" /><Text style={styles.detailText}>{registro.horario ? `Início às ${registro.horario}` : 'Horário não informado'}</Text></View>
          <View style={styles.detailRow}><Ionicons name="location-outline" size={17} color="#C2410C" /><Text style={styles.detailText}>{registro.endereco}</Text></View>
          {Boolean(registro.servicos) && <View style={styles.detailRow}><Ionicons name="sparkles-outline" size={17} color="#C2410C" /><Text style={styles.detailText}>{registro.servicos}</Text></View>}
        </View>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Avaliação recebida do cliente</Text>
          {registro.avaliacao ? (
            <>
              <View style={styles.ratingRow} accessible accessibilityLabel={`Nota ${registro.avaliacao.nota} de 5 estrelas`}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons key={star} name={registro.avaliacao!.nota >= star ? 'star' : registro.avaliacao!.nota >= star - 0.5 ? 'star-half' : 'star-outline'} size={17} color="#FFB800" />
                ))}
                <Text style={styles.rating}>{Number(registro.avaliacao.nota).toFixed(1).replace('.', ',')} / 5</Text>
              </View>
              <Text style={styles.reviewComment}>{registro.avaliacao.comentario?.trim() || 'O cliente não deixou um comentário.'}</Text>
            </>
          ) : <Text style={styles.reviewEmpty}>Esta diária ainda não foi avaliada pelo cliente.</Text>}
        </View>
        <View style={styles.historyFooter}>
          <View><Text style={styles.totalLabel}>Valor da diária</Text><Text style={styles.totalValue}>{registro.valor == null ? 'Não informado' : Number(registro.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></View>
          {['Aceito', 'Em_andamento', 'Concluido'].includes(registro.status) || registro.checkinExpirado ? (
            <TouchableOpacity accessibilityRole="button" style={styles.paymentButton}
              onPress={() => navigation.navigate('CheckInDiarista', { agendamentoId: registro.id })}>
              <Ionicons name={registro.status === 'Em_andamento' ? 'log-out-outline' : 'receipt-outline'} size={18} color="#FFFFFF" />
              <Text style={styles.paymentText}>{registro.status === 'Em_andamento' ? 'Finalizar diária' : 'Ver diária e pagamentos'}</Text>
              <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, styles.historyHeaderTitle]}>Histórico</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={27} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={[styles.scrollContent, styles.historyContainer]}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {loading && <ActivityIndicator color="#FF6B2C" />}
            <View style={styles.historyToolbar}>
              <View style={styles.historySearch}>
                <Ionicons name="search-outline" size={20} color="#667085" />
                <TextInput style={styles.historyInput} placeholder="Buscar cliente, serviço ou nº da diária" placeholderTextColor="#98A2B3" accessibilityLabel="Buscar no histórico" value={busca} onChangeText={setBusca} />
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
                  disabled={loading} onPress={() => setRefreshKey(current => current + 1)}
                  style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}>
                  {loading ? <ActivityIndicator size="small" color="#C2410C" /> : <Ionicons name="refresh-outline" size={18} color="#C2410C" />}
                  <Text style={styles.refreshText}>{loading ? 'Atualizando' : 'Atualizar'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sortRow}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Alterar ordenação" style={styles.sortButton} onPress={() => setOrdem(current => current === 'recentes' ? 'antigos' : 'recentes')}>
                  <Ionicons name="swap-vertical-outline" size={16} color="#C2410C" /><Text style={styles.sortText}>{ordem === 'recentes' ? 'Mais recentes' : 'Mais antigas'}</Text>
                </TouchableOpacity>
              </View>
              {temFiltros && <TouchableOpacity style={styles.resetFilters} onPress={limparFiltros}><Ionicons name="close-outline" size={17} color="#C2410C" /><Text style={styles.sortText}>Limpar filtros</Text></TouchableOpacity>}
            </View>
          {!loading && !error && paginaHistorico.data.map(renderCard)}
              {!loading && !error && paginaHistorico.pages > 1 && (
                <View style={styles.paginationActions}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Página anterior"
                    accessibilityState={{ disabled: paginaHistorico.page <= 1 }}
                    disabled={paginaHistorico.page <= 1}
                    style={[styles.pageButton, paginaHistorico.page <= 1 && styles.pageButtonDisabled]}
                    onPress={() => mudarPagina(paginaHistorico.page - 1)}>
                    <Ionicons name="chevron-back" size={18} color="#C2410C" /><Text style={styles.pageButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <Text accessibilityLiveRegion="polite" style={styles.pageNumber}>Página {paginaHistorico.page} de {paginaHistorico.pages}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próxima página"
                    accessibilityState={{ disabled: paginaHistorico.page >= paginaHistorico.pages }}
                    disabled={paginaHistorico.page >= paginaHistorico.pages}
                    style={[styles.pageButton, paginaHistorico.page >= paginaHistorico.pages && styles.pageButtonDisabled]}
                    onPress={() => mudarPagina(paginaHistorico.page + 1)}>
                    <Text style={styles.pageButtonText}>Próxima</Text><Ionicons name="chevron-forward" size={18} color="#C2410C" />
                  </TouchableOpacity>
                </View>
              )}

          {!loading && !error && historicoFiltrado.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>{temFiltros ? 'Nenhuma diária com esses filtros' : 'Nenhum agendamento encontrado'}</Text>
              <Text style={styles.emptyText}>{temFiltros ? 'Tente outro cliente, status ou data.' : 'Suas diárias aparecerão aqui.'}</Text>
            </View>
          )}
          {!loading && Boolean(error) && <Text style={styles.emptyText}>Não foi possível carregar o histórico. Toque em Atualizar para tentar novamente.</Text>}
        </ScrollView>
      </View>
      <ActionModal visible={errorModalVisible} variant="error" title="Não foi possível carregar o histórico"
        message={error} accentColor="#FF6B2C" onClose={() => setErrorModalVisible(false)} />
    </SafeAreaView>
  );
}
