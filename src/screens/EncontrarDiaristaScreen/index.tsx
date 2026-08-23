import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { getErrorMessage } from '../../services/api';
import { diaristaService } from '../../services/diaristaService';
import { favoritoService } from '../../services/favoritoService';
import { servicoService } from '../../services/servicoService';
import { clienteService } from '../../services/clienteService';
import type {
  Diarista as ApiDiarista,
  Favorito,
  Servico,
} from '../../services/types';
import { HeaderMenu } from '../../components/header-menu';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
  favoritoId?: number;
  respostaRapida?: boolean;
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
  const [busca, setBusca] = useState('');

  const [diaristas, setDiaristas] = useState<Diarista[]>([]);
  const [catalogoServicos, setCatalogoServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [cepCliente, setCepCliente] = useState<string | null>(null);
  const [loadingEndereco, setLoadingEndereco] = useState(true);
  const [favoritosEmAtualizacao, setFavoritosEmAtualizacao] = useState<number[]>([]);
  const { user } = useAuth();

  const [filtroAberto, setFiltroAberto] = useState('');

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] =
    useState('');
  const [avaliacaoAplicada, setAvaliacaoAplicada] = useState('');

  const [servicosSelecionados, setServicosSelecionados] =
    useState<string[]>([]);
  const [servicosAplicados, setServicosAplicados] = useState<string[]>([]);

  const [distanciaSelecionada, setDistanciaSelecionada] =
    useState('');
  const [distanciaAplicada, setDistanciaAplicada] = useState('');

  const [precoSelecionado, setPrecoSelecionado] =
    useState('');
  const [precoAplicado, setPrecoAplicado] = useState('');

  const [somenteRespostaRapida, setSomenteRespostaRapida] =
    useState(false);
  const [respostaRapidaAplicada, setRespostaRapidaAplicada] = useState(false);

  useEffect(() => {
    servicoService
      .listar()
      .then(setCatalogoServicos)
      .catch(() => setCatalogoServicos([]));
  }, []);

  useEffect(() => {
    async function sincronizarFavoritos() {
      if (user?.activeProfile !== 'CLIENTE') return;
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
    const timer = setTimeout(() => {
      carregarDiaristas();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    busca,
    avaliacaoAplicada,
    precoAplicado,
    servicosAplicados,
    respostaRapidaAplicada,
    distanciaAplicada,
    cepCliente,
    loadingEndereco,
    user?.id_usuario,
    catalogoServicos,
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
      respostaRapida: Boolean(profile.frequencia_resposta),
    };
  }

  async function carregarDiaristas() {
    try {
      setLoading(true);
      setErro('');
      if (!cepCliente) {
        setDiaristas([]);
        setErro('Cadastre um endereço com CEP para encontrar as diaristas mais próximas.');
        return;
      }
      const servicoSelecionado = catalogoServicos.find(
        (item) => item.nome_servico === servicosAplicados[0],
      );
      const query = {
        nome: busca.trim() || undefined,
        avaliacao_min: avaliacaoMinima(),
        ...faixaPreco(),
        id_servico: servicoSelecionado?.id_servico,
        cep_origem: cepCliente,
        distancia_max: distanciaMaxima(),
        ordenar: 'distancia' as const,
        limit: 100,
      };
      const firstPage = await diaristaService.listar({ ...query, page: 1 });
      const remainingPages = firstPage.pagination.pages > 1
        ? await Promise.all(
            Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
              diaristaService.listar({ ...query, page: index + 2 }),
            ),
          )
        : [];
      const profiles = [firstPage, ...remainingPages].flatMap((response) => response.data);
      const favoritosResponse = user?.activeProfile === 'CLIENTE'
        ? await favoritoService.listar({ limit: 100 }).catch(() => ({ data: [] as Favorito[] }))
        : { data: [] as Favorito[] };
      setDiaristas(
        profiles
          .map((item) =>
            apresentarDiarista(item, favoritosResponse.data),
          )
          .filter(
            (item) => !respostaRapidaAplicada || item.respostaRapida,
          ),
      );
    } catch (error) {
      setErro(getErrorMessage(error));
      setDiaristas([]);
    } finally {
      setLoading(false);
    }
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
    if (filtro === 'Serviços realizados') setServicosSelecionados([...servicosAplicados]);
    if (filtro === 'Distância') setDistanciaSelecionada(distanciaAplicada);
    if (filtro === 'Preço') setPrecoSelecionado(precoAplicado);
    if (filtro === 'Responde rápido') setSomenteRespostaRapida(respostaRapidaAplicada);
    setFiltroAberto(filtro);
  }

  function aplicarFiltro() {
    if (filtroAberto === 'Avaliação') setAvaliacaoAplicada(avaliacaoSelecionada);
    if (filtroAberto === 'Serviços realizados') setServicosAplicados([...servicosSelecionados]);
    if (filtroAberto === 'Distância') setDistanciaAplicada(distanciaSelecionada);
    if (filtroAberto === 'Preço') setPrecoAplicado(precoSelecionado);
    if (filtroAberto === 'Responde rápido') setRespostaRapidaAplicada(somenteRespostaRapida);
    setFiltroAberto('');
  }

  function limparRascunhoFiltro() {
    if (filtroAberto === 'Avaliação') setAvaliacaoSelecionada('');
    if (filtroAberto === 'Serviços realizados') setServicosSelecionados([]);
    if (filtroAberto === 'Distância') setDistanciaSelecionada('');
    if (filtroAberto === 'Preço') setPrecoSelecionado('');
    if (filtroAberto === 'Responde rápido') setSomenteRespostaRapida(false);
  }

  function filtroAplicado(filtro: string) {
    if (filtro === 'Avaliação') return Boolean(avaliacaoAplicada);
    if (filtro === 'Serviços realizados') return servicosAplicados.length > 0;
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

  function alternarServico(servico: string) {
    setServicosSelecionados((selecionadosAtuais) => {
      const estaSelecionado =
        selecionadosAtuais.includes(servico);

      if (estaSelecionado) {
        return selecionadosAtuais.filter(
          (item) => item !== servico
        );
      }

      return [...selecionadosAtuais, servico];
    });
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

  function renderFiltroServicos() {
    return (
      <View style={styles.filterPanel}>
        <Text style={styles.filterPanelTitle}>
          Serviços realizados
        </Text>

        <Text style={styles.filterPanelDescription}>
          Selecione um ou mais serviços.
        </Text>

        <View style={styles.checkboxGrid}>
          {catalogoServicos.map((item) => item.nome_servico).map((servico) => {
            const selecionado =
              servicosSelecionados.includes(servico);

            return (
              <TouchableOpacity
                key={servico}
                style={[
                  styles.checkboxOption,
                  selecionado &&
                    styles.checkboxOptionSelected,
                ]}
                onPress={() =>
                  alternarServico(servico)
                }
                activeOpacity={0.75}
              >
                <Ionicons
                  name={
                    selecionado
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={20}
                  color={
                    selecionado
                      ? '#18C7C8'
                      : '#999999'
                  }
                />

                <Text
                  style={[
                    styles.checkboxLabel,
                    selecionado &&
                      styles.checkboxLabelSelected,
                  ]}
                >
                  {servico}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          Exiba apenas profissionais que respondem rapidamente.
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerActions}>
              <HeaderMenu navigation={navigation} profile="cliente" accentColor="#18C7C8" />
            </View>
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
                    <Ionicons
                      name="person"
                      size={38}
                      color="#FFFFFF"
                    />
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

                    <View style={styles.quickResponse}>
                      <Ionicons
                        name="time-outline"
                        size={11}
                        color="#18C7C8"
                      />

                      <Text style={styles.quickResponseText}>
                        Responde rápido
                      </Text>
                    </View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
