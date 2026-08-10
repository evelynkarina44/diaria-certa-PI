import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type Aba = 'historico' | 'favoritos';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
};

const diaristasIniciais: Diarista[] = [
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
    nome: 'Maria da Silva',
    avaliacao: '4.9',
    quantidadeAvaliacoes: '128',
    distancia: '1,2 km de você',
    favorito: false,
  },
  {
    id: 3,
    nome: 'Maria da Silva',
    avaliacao: '4.9',
    quantidadeAvaliacoes: '128',
    distancia: '1,2 km de você',
    favorito: true,
  },
  {
    id: 4,
    nome: 'Maria da Silva',
    avaliacao: '4.9',
    quantidadeAvaliacoes: '128',
    distancia: '1,2 km de você',
    favorito: true,
  },
];

export default function HistoricoClienteScreen({
  navigation,
}: any) {
  const [aba, setAba] = useState<Aba>('historico');

  const [diaristas, setDiaristas] =
    useState<Diarista[]>(diaristasIniciais);

  function alternarFavorito(id: number) {
    setDiaristas((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              favorito: !item.favorito,
            }
          : item
      )
    );
  }

  function abrirPerfil() {
    navigation.navigate('PerfilDiarista');
  }

  function renderCard(diarista: Diarista) {
    return (
      <View
        key={diarista.id}
        style={styles.card}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={abrirPerfil}
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

            <View style={styles.quickBadge}>
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color="#18C7C8"
              />

              <Text style={styles.quickText}>
                Responde rápido
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => alternarFavorito(diarista.id)}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
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
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'historico' && styles.tabActive,
            ]}
            onPress={() => setAba('historico')}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'historico' && styles.tabTextActive,
              ]}
            >
              Histórico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'favoritos' && styles.tabActive,
            ]}
            onPress={() => setAba('favoritos')}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'favoritos' && styles.tabTextActive,
              ]}
            >
              Favoritos
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {aba === 'historico' ? (
            <>
              <Text style={styles.dateTitle}>
                14 de Julho
              </Text>

              {renderCard(diaristas[0])}

              <Text style={styles.dateTitle}>
                8 de Julho
              </Text>

              {renderCard(diaristas[1])}

              <View style={styles.cardGap}>
                {renderCard(diaristas[2])}
              </View>

              <Text style={styles.dateTitle}>
                30 de Junho
              </Text>

              {renderCard(diaristas[3])}
            </>
          ) : (
            <>
              <Text style={styles.favoriteTitle}>
                Confira a sua lista de favoritos
              </Text>

              <View style={styles.favoritesList}>
                {diaristas
                  .filter((item) => item.favorito)
                  .map((item) => renderCard(item))}
              </View>

              {diaristas.filter((item) => item.favorito)
                .length === 0 && (
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