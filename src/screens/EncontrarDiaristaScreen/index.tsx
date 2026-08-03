import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
};

const filtros = [
  'Avaliação',
  'Serviços realizados',
  'Distância',
  'Preço',
  'Responde rápido',
];

const opcoesServicos = [
  'Limpeza geral',
  'Limpeza pesada',
  'Passar roupas',
  'Cozinha',
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

const listaInicialDiaristas: Diarista[] = [
  {
    id: 1,
    nome: 'Maria da Silva',
    avaliacao: '4.9',
    quantidadeAvaliacoes: '128',
    distancia: '1,2 km de você',
    favorito: false,
  },
  {
    id: 2,
    nome: 'Ana Oliveira',
    avaliacao: '4.8',
    quantidadeAvaliacoes: '94',
    distancia: '1,7 km de você',
    favorito: false,
  },
  {
    id: 3,
    nome: 'Juliana Santos',
    avaliacao: '4.7',
    quantidadeAvaliacoes: '76',
    distancia: '2,1 km de você',
    favorito: false,
  },
];

export default function EncontrarDiaristaScreen({
  navigation,
}: any) {
  const [busca, setBusca] = useState('');
  const [diaristas, setDiaristas] = useState<Diarista[]>(
    listaInicialDiaristas
  );

  const [filtroAberto, setFiltroAberto] = useState('');

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] =
    useState('4 estrelas ou mais');

  const [servicosSelecionados, setServicosSelecionados] = useState<
    string[]
  >([]);

  const [distanciaSelecionada, setDistanciaSelecionada] =
    useState('Até 5 km');

  const [precoSelecionado, setPrecoSelecionado] =
    useState('De R$ 100 a R$ 150');

  const [somenteRespostaRapida, setSomenteRespostaRapida] =
    useState(false);

  function abrirPerfil(diarista: Diarista) {
    navigation.navigate('PerfilDiarista', {
      diaristaId: diarista.id,
    });
  }

  function alternarFavorito(id: number) {
    setDiaristas((listaAtual) =>
      listaAtual.map((diarista) =>
        diarista.id === id
          ? {
              ...diarista,
              favorito: !diarista.favorito,
            }
          : diarista
      )
    );
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
          {opcoesServicos.map((servico) => {
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
          Exiba apenas profissionais que costumam responder
          rapidamente.
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

            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person"
                size={21}
                color="#111111"
              />
            </TouchableOpacity>
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
            {diaristas.map((diarista) => (
              <View
                key={diarista.id}
                style={styles.professionalCard}
              >
                <TouchableOpacity
                  style={styles.professionalMainContent}
                  onPress={() => abrirPerfil(diarista)}
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

                      <Text
                        style={styles.quickResponseText}
                      >
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
                  accessibilityLabel={
                    diarista.favorito
                      ? 'Remover dos favoritos'
                      : 'Adicionar aos favoritos'
                  }
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
                        ? '#FF4D4F'
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