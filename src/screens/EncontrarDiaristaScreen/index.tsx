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
import type {
  Diarista as ApiDiarista,
  Favorito,
  Servico,
} from '../../services/types';

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
  const { user } = useAuth();

  const [filtroAberto, setFiltroAberto] = useState('');

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] =
    useState('4 estrelas ou mais');

  const [servicosSelecionados, setServicosSelecionados] =
    useState<string[]>([]);

  const [distanciaSelecionada, setDistanciaSelecionada] =
    useState('Até 5 km');

  const [precoSelecionado, setPrecoSelecionado] =
    useState('De R$ 100 a R$ 150');

  const [somenteRespostaRapida, setSomenteRespostaRapida] =
    useState(false);

  useEffect(() => {
    servicoService
      .listar()
      .then(setCatalogoServicos)
      .catch(() => setCatalogoServicos([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarDiaristas();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    busca,
    avaliacaoSelecionada,
    precoSelecionado,
    servicosSelecionados,
    somenteRespostaRapida,
    user?.id_usuario,
    catalogoServicos,
  ]);

  function avaliacaoMinima() {
    if (avaliacaoSelecionada.startsWith('5')) return 5;
    if (avaliacaoSelecionada.startsWith('4')) return 4;
    return 3;
  }

  function faixaPreco() {
    if (precoSelecionado.includes('Até R$ 100')) {
      return { preco_max: 100 };
    }
    if (precoSelecionado.includes('150 a R$ 200')) {
      return { preco_min: 150, preco_max: 200 };
    }
    if (precoSelecionado.includes('Acima')) {
      return { preco_min: 200 };
    }
    return { preco_min: 100, preco_max: 150 };
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
      distancia: endereco
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
      const servicoSelecionado = catalogoServicos.find(
        (item) => item.nome_servico === servicosSelecionados[0],
      );
      const [response, favoritosResponse] = await Promise.all([
        diaristaService.listar({
          nome: busca.trim() || undefined,
          avaliacao_min: avaliacaoMinima(),
          ...faixaPreco(),
          id_servico: servicoSelecionado?.id_servico,
        }),
        user?.cliente?.length
          ? favoritoService.listar({ limit: 100 })
          : Promise.resolve({ data: [] as Favorito[] }),
      ]);
      setDiaristas(
        response.data
          .map((item) =>
            apresentarDiarista(item, favoritosResponse.data),
          )
          .filter(
            (item) => !somenteRespostaRapida || item.respostaRapida,
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

  function abrirHistorico() {
    navigation.navigate('HistoricoCliente');
  }

  function abrirPerfilCliente() {
    navigation.navigate('PerfilCliente');
  }

  async function alternarFavorito(id: number) {
    if (!user?.cliente?.length) {
      Alert.alert('Perfil necessário', 'Entre com um perfil de cliente.');
      return;
    }
    const diarista = diaristas.find((item) => item.id === id);
    if (!diarista) return;
    try {
      if (diarista.favorito && diarista.favoritoId) {
        await favoritoService.remover(diarista.favoritoId);
      } else {
        await favoritoService.criar(id);
      }
      await carregarDiaristas();
    } catch (error) {
      Alert.alert('Não foi possível atualizar', getErrorMessage(error));
    }
  }

  function alternarFiltro(filtro: string) {
    setFiltroAberto((filtroAtual) =>
      filtroAtual === filtro ? '' : filtro
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={abrirHistorico}
                activeOpacity={0.7}
                accessibilityLabel="Abrir histórico e favoritos"
              >
                <Ionicons
                  name="clipboard-outline"
                  size={22}
                  color="#111111"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={abrirPerfilCliente}
                activeOpacity={0.7}
                accessibilityLabel="Abrir perfil"
              >
                <Ionicons
                  name="person"
                  size={21}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.welcome}>
            Olá, usuário!
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

              return (
                <TouchableOpacity
                  key={filtro}
                  style={[
                    styles.filterButton,
                    estaAberto &&
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
                      estaAberto &&
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
                      estaAberto
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
