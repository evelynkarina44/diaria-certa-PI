import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { getErrorMessage } from '../../services/api';
import { diaristaService } from '../../services/diaristaService';
import { favoritoService } from '../../services/favoritoService';
import { clienteService } from '../../services/clienteService';
import type {
  Diarista as ApiDiarista,
  Favorito,
} from '../../services/types';
import { ActionModal } from '../../components/action-modal';
import { updateServiceDraft } from '../../utils/serviceFilterDraft';
import { HeaderMenu } from '../../components/header-menu';
import { NotificationBell } from '../../components/notification-bell';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
  favoritoId?: number;
  respostaRapida?: boolean;
  fotoPerfil?: string | null;
};

const filtros = [
  'Avaliação',
  'Serviços realizados',
  'Distância',
  'Preço',
  'Responde rápido',
];

const opcoesDistancia = [
  'Até 2 km',
  'Até 5 km',
  'Até 10 km',
  'Qualquer distância',
];

const opcoesPreco = [
  'Até R$ 100',
  'De R$ 100 a R$ 150',
  'De R$ 150 a R$ 200',
  'Acima de R$ 200',
];

export default function EncontrarDiaristaScreen({
  navigation,
}: any) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const buscaId = useRef(0);
  const [paginacaoBusca, setPaginacaoBusca] = useState({ chave: '', pagina: 1 });
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busca, setBusca] = useState('');
  const [atualizacaoBusca, setAtualizacaoBusca] = useState(0);

  const [diaristas, setDiaristas] = useState<Diarista[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [cepCliente, setCepCliente] = useState<string | null>(null);
  const [loadingEndereco, setLoadingEndereco] = useState(true);
  const [favoritosEmAtualizacao, setFavoritosEmAtualizacao] = useState<number[]>([]);
  const [fotosComErro, setFotosComErro] = useState<number[]>([]);
  const { user } = useAuth();

  const [filtroAberto, setFiltroAberto] = useState('');

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] =
    useState('');
  const [avaliacaoAplicada, setAvaliacaoAplicada] = useState('');

  const [servicoDigitado, setServicoDigitado] = useState('');
  const [servicoAplicado, setServicoAplicado] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<string | null>(null);
  const [erroServico, setErroServico] = useState('');

  const [distanciaSelecionada, setDistanciaSelecionada] =
    useState('');
  const [distanciaAplicada, setDistanciaAplicada] = useState('');

  const [precoSelecionado, setPrecoSelecionado] =
    useState('');
  const [precoAplicado, setPrecoAplicado] = useState('');

  const [somenteRespostaRapida, setSomenteRespostaRapida] =
    useState(false);
  const [respostaRapidaAplicada, setRespostaRapidaAplicada] = useState(false);

  // Uma busca ou filtro novo começa na primeira página; atualizar mantém a página atual.
  const chaveBusca = JSON.stringify([busca, avaliacaoAplicada, precoAplicado,
    servicoAplicado, respostaRapidaAplicada, distanciaAplicada, cepCliente, user?.id_usuario]);
  const paginaAtual = paginacaoBusca.chave === chaveBusca ? paginacaoBusca.pagina : 1;

  useEffect(() => {
    async function sincronizarFavoritos() {
      if (user?.activeProfile !== 'CLIENTE') return;
      setAtualizacaoBusca((current) => current + 1);
      try {
        const response = await favoritoService.listar({ limit: 100 });
        setDiaristas((current) => current.map((diarista) => {
          const favorito = response.data.find((item) => item.id_diarista === diarista.id);
          return {
            ...diarista,
            favorito: Boolean(favorito),
            favoritoId: favorito?.id_favorito,
          };
        }));
      } catch {
        // A busca principal continua disponível mesmo se a sincronização falhar.
      }
    }

    const unsubscribe = navigation.addListener('focus', sincronizarFavoritos);
    return unsubscribe;
  }, [navigation, user?.activeProfile]);

  useEffect(() => {
    const idCliente = user?.cliente?.[0]?.id_cliente;
    if (!idCliente || user?.activeProfile !== 'CLIENTE') {
      setCepCliente('');
      setLoadingEndereco(false);
      return;
    }

    setLoadingEndereco(true);
    clienteService.buscarPorId(idCliente)
      .then((cliente) => setCepCliente(cliente.endereco?.[0]?.cep ?? ''))
      .catch((error) => {
        setCepCliente('');
        setErro(getErrorMessage(error));
      })
      .finally(() => setLoadingEndereco(false));
  }, [user?.activeProfile, user?.cliente]);

  useEffect(() => {
    if (loadingEndereco) return;
    const id = ++buscaId.current;
    setLoading(true);
    setDiaristas([]);
    const timer = setTimeout(() => {
      carregarDiaristas(id);
    }, 300);
    return () => { clearTimeout(timer); buscaId.current++; };
  }, [
    busca,
    atualizacaoBusca,
    avaliacaoAplicada,
    precoAplicado,
    servicoAplicado,
    respostaRapidaAplicada,
    distanciaAplicada,
    cepCliente,
    loadingEndereco,
    user?.id_usuario,
    paginaAtual,
  ]);

  function avaliacaoMinima() {
    if (avaliacaoAplicada.startsWith('5')) return 5;
    if (avaliacaoAplicada.startsWith('4')) return 4;
    if (avaliacaoAplicada.startsWith('3')) return 3;
    return undefined;
  }

  function faixaPreco() {
    if (precoAplicado.includes('Até R$ 100')) {
      return { preco_max: 100 };
    }
    if (precoAplicado.includes('150 a R$ 200')) {
      return { preco_min: 150, preco_max: 200 };
    }
    if (precoAplicado.includes('Acima')) {
      return { preco_min: 200 };
    }
    if (precoAplicado.includes('100 a R$ 150')) {
      return { preco_min: 100, preco_max: 150 };
    }
    return {};
  }

  function distanciaMaxima() {
    if (distanciaAplicada.includes('2 km')) return 2;
    if (distanciaAplicada.includes('5 km')) return 5;
    if (distanciaAplicada.includes('10 km')) return 10;
    return undefined;
  }

  function apresentarDiarista(
    profile: ApiDiarista,
    favoritos: Favorito[],
  ): Diarista {
    const endereco = profile.endereco?.[0];
    const favorito = favoritos.find(
      (item) => item.id_diarista === profile.id_diarista,
    );
    return {
      id: profile.id_diarista,
      nome: profile.usuario?.nome ?? 'Diarista',
      avaliacao: Number(profile.avaliacao_media ?? 0).toFixed(1),
      quantidadeAvaliacoes: String(profile.avaliacao?.length ?? 0),
      distancia: profile.distancia_km !== null && profile.distancia_km !== undefined
        ? `${profile.distancia_km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km de distância`
        : endereco
          ? `${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`
        : 'Localização não informada',
      favorito: Boolean(favorito),
      favoritoId: favorito?.id_favorito,
      respostaRapida: profile.responde_rapido === true,
      fotoPerfil: profile.usuario?.foto_perfil,
    };
  }

  async function carregarDiaristas(id: number) {
    try {
      setLoading(true);
      setErro('');
      if (!cepCliente) {
        setDiaristas([]);
        setTotalPaginas(0);
        setErro('Cadastre um endereço com CEP para encontrar as diaristas mais próximas.');
        return;
      }
      const query = {
        nome: busca.trim() || undefined,
        responde_rapido: respostaRapidaAplicada ? true : undefined,
        avaliacao_min: avaliacaoMinima(),
        ...faixaPreco(),
        servico_nome: servicoAplicado.trim() || undefined,
        cep_origem: cepCliente,
        distancia_max: distanciaMaxima(),
        ordenar: 'distancia' as const,
        limit: 10,
        page: paginaAtual,
      };
      const response = await diaristaService.listar(query);
      if (id !== buscaId.current) return;
      const pages = response.pagination.pages;
      if (paginaAtual > Math.max(1, pages)) {
        setPaginacaoBusca({ chave: chaveBusca, pagina: Math.max(1, pages) });
        return;
      }
      const favoritosResponse = user?.activeProfile === 'CLIENTE'
        ? await favoritoService.listar({ limit: 100 }).catch(() => ({ data: [] as Favorito[] }))
        : { data: [] as Favorito[] };
      if (id !== buscaId.current) return;
      setTotalPaginas(pages);
      setDiaristas(
        response.data
          .filter((profile) => profile.id_usuario !== user?.id_usuario)
          .map((item) =>
            apresentarDiarista(item, favoritosResponse.data),
          )
          .filter(
            (item) => !respostaRapidaAplicada || item.respostaRapida,
          ),
      );
    } catch (error) {
      if (id !== buscaId.current) return;
      setErro(getErrorMessage(error));
      setDiaristas([]);
      setTotalPaginas(0);
    } finally {
      if (id === buscaId.current) setLoading(false);
    }
  }

  function mudarPagina(pagina: number) {
    if (loading || pagina < 1 || pagina > totalPaginas) return;
    buscaId.current++;
    setLoading(true);
    setDiaristas([]);
    setPaginacaoBusca({ chave: chaveBusca, pagina });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function abrirPerfilDiarista(diarista: Diarista) {
    navigation.navigate('PerfilDiarista', {
      diaristaId: diarista.id,
    });
  }

  async function alternarFavorito(id: number) {
    if (user?.activeProfile !== 'CLIENTE') {
      Alert.alert('Perfil necessário', 'Entre com um perfil de cliente.');
      return;
    }
    const diarista = diaristas.find((item) => item.id === id);
    if (!diarista || favoritosEmAtualizacao.includes(id)) return;
    setFavoritosEmAtualizacao((current) => [...current, id]);
    try {
      if (diarista.favorito && diarista.favoritoId) {
        await favoritoService.remover(diarista.favoritoId);
        setDiaristas((current) => current.map((item) => item.id === id
          ? { ...item, favorito: false, favoritoId: undefined }
          : item));
      } else {
        const favorito = await favoritoService.criar(id);
        setDiaristas((current) => current.map((item) => item.id === id
          ? { ...item, favorito: true, favoritoId: favorito.id_favorito }
          : item));
      }
    } catch (error) {
      Alert.alert('Não foi possível atualizar', getErrorMessage(error));
    } finally {
      setFavoritosEmAtualizacao((current) => current.filter((item) => item !== id));
    }
  }

  function alternarFiltro(filtro: string) {
    if (filtroAberto === filtro) {
      setFiltroAberto('');
      return;
    }

    if (filtro === 'Avaliação') setAvaliacaoSelecionada(avaliacaoAplicada);
    if (filtro === 'Serviços realizados') {
      setServicosSelecionados(servicoAplicado.split(',').map(value => value.trim()).filter(Boolean));
      setServicoDigitado(''); setServicoEmEdicao(null);
    }
    if (filtro === 'Distância') setDistanciaSelecionada(distanciaAplicada);
    if (filtro === 'Preço') setPrecoSelecionado(precoAplicado);
    if (filtro === 'Responde rápido') setSomenteRespostaRapida(respostaRapidaAplicada);
    setFiltroAberto(filtro);
  }

  function aplicarFiltro() {
    if (filtroAberto === 'Avaliação') setAvaliacaoAplicada(avaliacaoSelecionada);
    if (filtroAberto === 'Serviços realizados') {
      let services = servicosSelecionados;
      if (servicoDigitado.trim() || servicoEmEdicao !== null) {
        const result = updateServiceDraft(services, servicoDigitado, servicoEmEdicao);
        if (result.error !== undefined) { setErroServico(result.error); return; }
        services = result.services;
      }
      setServicosSelecionados(services);
      setServicoAplicado(services.join(', '));
      setServicoDigitado(''); setServicoEmEdicao(null);
    }
    if (filtroAberto === 'Distância') setDistanciaAplicada(distanciaSelecionada);
    if (filtroAberto === 'Preço') setPrecoAplicado(precoSelecionado);
    if (filtroAberto === 'Responde rápido') setRespostaRapidaAplicada(somenteRespostaRapida);
    setFiltroAberto('');
  }

  function limparRascunhoFiltro() {
    if (filtroAberto === 'Avaliação') setAvaliacaoSelecionada('');
    if (filtroAberto === 'Serviços realizados') {
      setServicosSelecionados([]); setServicoDigitado(''); setServicoEmEdicao(null);
    }
    if (filtroAberto === 'Distância') setDistanciaSelecionada('');
    if (filtroAberto === 'Preço') setPrecoSelecionado('');
    if (filtroAberto === 'Responde rápido') setSomenteRespostaRapida(false);
  }

  function filtroAplicado(filtro: string) {
    if (filtro === 'Avaliação') return Boolean(avaliacaoAplicada);
    if (filtro === 'Serviços realizados') return servicoAplicado.length > 0;
    if (filtro === 'Distância') return Boolean(distanciaAplicada);
    if (filtro === 'Preço') return Boolean(precoAplicado);
    if (filtro === 'Responde rápido') return respostaRapidaAplicada;
    return false;
  }

  function renderAcoesFiltro() {
    return (
      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.clearFilterButton} onPress={limparRascunhoFiltro} activeOpacity={0.8}>
          <Text style={styles.clearFilterText}>Limpar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyFilterButton} onPress={aplicarFiltro} activeOpacity={0.8}>
          <Text style={styles.applyFilterText}>Aplicar filtro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderFiltroAvaliacao() {
    const opcoes = [
      '5 estrelas',
      '4 estrelas ou mais',
      '3 estrelas ou mais',
    ];

    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>
          Avaliação
        </Text>

        <Text style={styles.filterPanelDescription}>
          Escolha a avaliação mínima desejada.
        </Text>

        <View style={styles.filterOptionsList}>
          {opcoes.map((opcao) => {
            const selecionada =
              avaliacaoSelecionada === opcao;

            return (
              <TouchableOpacity
                key={opcao}
                style={styles.radioOption}
                onPress={() =>
                  setAvaliacaoSelecionada(opcao)
                }
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selecionada &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selecionada && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Text style={styles.radioLabel}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderAcoesFiltro()}
      </View>
    );
  }

  function adicionarServico() {
    const result = updateServiceDraft(servicosSelecionados, servicoDigitado, servicoEmEdicao);
    if (result.error !== undefined) { setErroServico(result.error); return; }
    setServicosSelecionados(result.services);
    setServicoDigitado(''); setServicoEmEdicao(null);
  }

  function renderFiltroServicos() {
    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>Serviços realizados</Text>
        <Text style={styles.filterPanelDescription}>Digite e adicione os serviços desejados. Use o lápis para editar ou o X para remover. A busca só muda ao aplicar o filtro.</Text>
        <View style={styles.serviceEntryRow}>
          <View style={[styles.serviceSearchRow, { flex: 1 }]}>
            <Ionicons name="search-outline" size={20} color="#667085" />
            <TextInput
              style={styles.searchInput}
              accessibilityLabel="Nome do serviço"
              placeholder="Ex.: limpeza de janelas"
              placeholderTextColor="#98A2B3"
              value={servicoDigitado}
              onChangeText={setServicoDigitado}
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={adicionarServico}
            />
          </View>
          <TouchableOpacity accessibilityRole="button" style={styles.addServiceButton} onPress={adicionarServico}>
            <Ionicons name={servicoEmEdicao ? 'checkmark' : 'add'} size={20} color="#FFFFFF" />
            <Text style={styles.addServiceText}>{servicoEmEdicao ? 'Alterar' : 'Adicionar'}</Text>
          </TouchableOpacity>
        </View>
        {servicoEmEdicao && <TouchableOpacity onPress={() => { setServicoEmEdicao(null); setServicoDigitado(''); }}><Text style={styles.serviceHint}>Cancelar edição de {servicoEmEdicao}</Text></TouchableOpacity>}
        <Text style={styles.serviceListTitle}>Serviços selecionados ({servicosSelecionados.length}/10)</Text>
        <View style={styles.serviceChips}>
          {servicosSelecionados.map(service => (
            <View key={service} style={styles.serviceChip}>
              <Text style={styles.serviceChipText}>{service}</Text>
              <TouchableOpacity style={styles.serviceChipAction} accessibilityLabel={`Editar serviço ${service}`} onPress={() => { setServicoEmEdicao(service); setServicoDigitado(service); }}>
                <Ionicons name="create-outline" size={19} color="#008A99" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceChipAction} accessibilityLabel={`Remover serviço ${service}`} onPress={() => {
                setServicosSelecionados(current => current.filter(value => value !== service));
                if (servicoEmEdicao === service) { setServicoEmEdicao(null); setServicoDigitado(''); }
              }}>
                <Ionicons name="close-circle" size={19} color="#008A99" />
              </TouchableOpacity>
            </View>
          ))}
          {!servicosSelecionados.length && <Text style={styles.serviceHint}>Nenhum serviço adicionado.</Text>}
        </View>
        {renderAcoesFiltro()}
      </View>
    );
  }

  function renderFiltroDistancia() {
    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>
          Distância
        </Text>

        <Text style={styles.filterPanelDescription}>
          Escolha a distância máxima.
        </Text>

        <View style={styles.filterOptionsList}>
          {opcoesDistancia.map((opcao) => {
            const selecionada =
              distanciaSelecionada === opcao;

            return (
              <TouchableOpacity
                key={opcao}
                style={styles.radioOption}
                onPress={() =>
                  setDistanciaSelecionada(opcao)
                }
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selecionada &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selecionada && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Text style={styles.radioLabel}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderAcoesFiltro()}
      </View>
    );
  }

  function renderFiltroPreco() {
    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>
          Preço
        </Text>

        <Text style={styles.filterPanelDescription}>
          Selecione uma faixa de preço.
        </Text>

        <View style={styles.filterOptionsList}>
          {opcoesPreco.map((opcao) => {
            const selecionada =
              precoSelecionado === opcao;

            return (
              <TouchableOpacity
                key={opcao}
                style={styles.radioOption}
                onPress={() =>
                  setPrecoSelecionado(opcao)
                }
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selecionada &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selecionada && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Text style={styles.radioLabel}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderAcoesFiltro()}
      </View>
    );
  }

  function renderFiltroRespostaRapida() {
    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>
          Responde rápido
        </Text>

        <Text style={styles.filterPanelDescription}>
          Exiba apenas quem aceita ou recusa todas as solicitações em até 24 horas. É preciso ter ao menos uma resposta; pedidos atrasados ou expirados impedem o selo.
        </Text>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() =>
            setSomenteRespostaRapida(
              (valorAtual) => !valorAtual
            )
          }
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.customSwitch,
              somenteRespostaRapida &&
                styles.customSwitchActive,
            ]}
          >
            <View
              style={[
                styles.customSwitchCircle,
                somenteRespostaRapida &&
                  styles.customSwitchCircleActive,
              ]}
            />
          </View>

          <Text style={styles.switchLabel}>
            Mostrar apenas quem responde rápido
          </Text>
        </TouchableOpacity>
        {renderAcoesFiltro()}
      </View>
    );
  }

  function renderConteudoFiltro() {
    switch (filtroAberto) {
      case 'Avaliação':
        return renderFiltroAvaliacao();

      case 'Serviços realizados':
        return renderFiltroServicos();

      case 'Distância':
        return renderFiltroDistancia();

      case 'Preço':
        return renderFiltroPreco();

      case 'Responde rápido':
        return renderFiltroRespostaRapida();

      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.headerTop, { justifyContent: 'space-between' }]}>
            <View style={styles.headerActions}>
              <HeaderMenu navigation={navigation} profile="cliente" accentColor="#18C7C8" />
            </View>
            <NotificationBell navigation={navigation} accentColor="#18C7C8" />
          </View>

          <Text style={styles.welcome}>
            Olá, {user?.nome?.split(' ')[0] ?? 'cliente'}!
          </Text>

          <Text style={styles.headerDescription}>
            Onde deseja encontrar sua diarista?
          </Text>
        </View>

        <View style={styles.locationCard}>
          <TouchableOpacity
            style={styles.locationRow}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location"
              size={22}
              color="#18C7C8"
            />

            <Text style={styles.locationText}>
              Minha localização
            </Text>
          </TouchableOpacity>

          <View style={styles.searchRow}>
            <Ionicons
              name="search"
              size={21}
              color="#A0A0A0"
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar diaristas próximas"
              placeholderTextColor="#A0A0A0"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>
            Filtrar por
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filtros.map((filtro) => {
              const estaAberto =
                filtroAberto === filtro;
              const estaAtivo = estaAberto || filtroAplicado(filtro);

              return (
                <TouchableOpacity
                  key={filtro}
                  style={[
                    styles.filterButton,
                    estaAtivo &&
                      styles.filterButtonSelected,
                  ]}
                  onPress={() =>
                    alternarFiltro(filtro)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      estaAtivo &&
                        styles.filterTextSelected,
                    ]}
                  >
                    {filtro}
                  </Text>

                  <Ionicons
                    name={
                      estaAberto
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={13}
                    color={
                      estaAtivo
                        ? '#18C7C8'
                        : '#777777'
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {renderConteudoFiltro()}

          <Text style={styles.listTitle}>
            Diaristas próximas
          </Text>

          <View style={styles.list}>
            {loading && <ActivityIndicator color={'#18C7C8'} />}
            {!loading && Boolean(erro) && (
              <Text style={styles.distance}>{erro}</Text>
            )}
            {!loading && !erro && diaristas.length === 0 && (
              <Text style={styles.distance}>
                Nenhuma diarista encontrada com os filtros informados.
              </Text>
            )}
            {diaristas.map((diarista) => (
              <View
                key={diarista.id}
                style={styles.professionalCard}
              >
                <TouchableOpacity
                  style={styles.professionalMainContent}
                  onPress={() =>
                    abrirPerfilDiarista(diarista)
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.avatar}>
                    {diarista.fotoPerfil && !fotosComErro.includes(diarista.id) ? (
                      <Image
                        source={{ uri: diarista.fotoPerfil }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                        onError={() => setFotosComErro((current) => (
                          current.includes(diarista.id) ? current : [...current, diarista.id]
                        ))}
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={38}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <View style={styles.professionalInfo}>
                    <Text style={styles.professionalName}>
                      {diarista.nome}
                    </Text>

                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingValue}>
                        {diarista.avaliacao}
                      </Text>

                      <Ionicons
                        name="star"
                        size={13}
                        color="#FFB800"
                      />

                      <Text style={styles.ratingCount}>
                        ({diarista.quantidadeAvaliacoes})
                      </Text>
                    </View>

                    <Text style={styles.distance}>
                      {diarista.distancia}
                    </Text>

                    {diarista.respostaRapida && <View style={styles.quickResponse}>
                      <Ionicons
                        name="time-outline"
                        size={11}
                        color="#18C7C8"
                      />

                      <Text style={styles.quickResponseText}>
                        Responde rápido
                      </Text>
                    </View>}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() =>
                    alternarFavorito(diarista.id)
                  }
                  disabled={favoritosEmAtualizacao.includes(diarista.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      diarista.favorito
                        ? 'heart'
                        : 'heart-outline'
                    }
                    size={23}
                    color={
                      diarista.favorito
                        ? '#E0001B'
                        : '#A0A0A0'
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {!erro && totalPaginas > 1 && (
            <View style={styles.pagination}>
              <View style={styles.paginationActions}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Página anterior"
                  accessibilityState={{ disabled: loading || paginaAtual <= 1 }}
                  disabled={loading || paginaAtual <= 1}
                  style={[styles.pageButton, (loading || paginaAtual <= 1) && styles.pageButtonDisabled]}
                  onPress={() => mudarPagina(paginaAtual - 1)}>
                  <Ionicons name="chevron-back" size={18} color="#008A99" />
                  <Text style={styles.pageButtonText}>Anterior</Text>
                </TouchableOpacity>
                <Text accessibilityLiveRegion="polite" style={styles.pageNumber}>Página {paginaAtual} de {totalPaginas}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próxima página"
                  accessibilityState={{ disabled: loading || paginaAtual >= totalPaginas }}
                  disabled={loading || paginaAtual >= totalPaginas}
                  style={[styles.pageButton, (loading || paginaAtual >= totalPaginas) && styles.pageButtonDisabled]}
                  onPress={() => mudarPagina(paginaAtual + 1)}>
                  <Text style={styles.pageButtonText}>Próxima</Text>
                  <Ionicons name="chevron-forward" size={18} color="#008A99" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.chatbotFloatingButton, { bottom: insets.bottom + 20, right: insets.right + 20 }]}
        accessibilityRole="button"
        accessibilityLabel="Abrir assistente Diária Certa"
        accessibilityHint="Converse com o chatbot para encontrar uma diarista"
        onPress={() => navigation.navigate('Chatbot')}
        activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses-outline" size={29} color="#FFFFFF" />
      </TouchableOpacity>
      <ActionModal visible={Boolean(erroServico)} variant="error" title="Confira os serviços" message={erroServico} onClose={() => setErroServico('')} />
    </SafeAreaView>
  );
}
