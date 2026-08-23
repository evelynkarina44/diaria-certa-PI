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
import { favoritoService } from '../../services/favoritoService';
import { getErrorMessage } from '../../services/api';
import type {
  Agendamento,
  Diarista as ApiDiarista,
  Favorito,
} from '../../services/types';

type Aba = 'historico' | 'favoritos';

type Diarista = {
  id: number;
  nome: string;
  avaliacao: string;
  quantidadeAvaliacoes: string;
  distancia: string;
  favorito: boolean;
  diaristaId?: number;
  favoritoId?: number;
  data?: string;
};

export default function HistoricoClienteScreen({
  navigation,
}: any) {
  const [aba, setAba] = useState<Aba>('historico');

  const [historico, setHistorico] = useState<Diarista[]>([]);
  const [favoritos, setFavoritos] = useState<Diarista[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroHistorico, setErroHistorico] = useState('');
  const [erroFavoritos, setErroFavoritos] = useState('');

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
      data: new Date(appointment.data_agendamento).toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric' },
      ),
    };
  }

  async function carregarDados() {
    setLoading(true);
    const [appointmentsResult, favoritesResult] = await Promise.allSettled([
      agendamentoService.listar({ visao: 'historico', limit: 100 }),
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
          {loading && <ActivityIndicator color={'#18C7C8'} />}
          {aba === 'historico' ? (
            <>
              {Boolean(erroHistorico) && <Text style={styles.emptyText}>{erroHistorico}</Text>}
              {historico.map((item) => (
                <React.Fragment key={item.id}>
                  <Text style={styles.dateTitle}>
                    {item.data}
                  </Text>
                  {renderCard(item)}
                </React.Fragment>
              ))}
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
