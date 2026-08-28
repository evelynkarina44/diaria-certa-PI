import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { diaristaService } from '../../services/diaristaService';
import { getErrorMessage } from '../../services/api';
import type { Diarista } from '../../services/types';

export default function PerfilDiaristaScreen({
  navigation,
  route,
}: any) {
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [loading, setLoading] = useState(true);
  const diaristaId = Number(route.params?.diaristaId);
  const currency = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const rating = Number(profile?.avaliacao_media ?? 0);

  useEffect(() => {
    if (!diaristaId) {
      setLoading(false);
      return;
    }
    diaristaService
      .buscarPorId(diaristaId)
      .then(setProfile)
      .catch((error) =>
        Alert.alert('Não foi possível carregar o perfil', getErrorMessage(error)),
      )
      .finally(() => setLoading(false));
  }, [diaristaId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={'#18C7C8'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Voltar"
          >
            <Ionicons
              name="chevron-back"
              size={29}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.imagePlaceholder}>
            {profile?.usuario?.foto_perfil ? (
              <Image
                source={{ uri: profile.usuario.foto_perfil }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={84} color="#D1D1D1" />
            )}
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.name}>
            {profile?.usuario?.nome ?? 'Diarista'}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>
              {rating.toFixed(1)}
            </Text>

            {[1, 2, 3, 4, 5].map((item) => (
              <Ionicons
                key={item}
                name={rating >= item ? 'star' : 'star-outline'}
                size={19}
                color="#FFB800"
              />
            ))}

            <Text style={styles.ratingCount}>
              ({profile?.avaliacao?.length ?? 0} avaliações)
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Sobre
          </Text>

          <Text style={styles.aboutText}>
            {profile?.descricao ?? 'Descrição não informada.'}
          </Text>

          <Text style={styles.sectionTitle}>
            Serviços
          </Text>

          <View style={styles.servicesGrid}>
            {(profile?.diarista_servico ?? []).map((item) => (
              <View
                key={item.id_diarista_servico}
                style={styles.serviceButton}
              >
                <Text style={styles.serviceText}>
                  {item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}
                </Text>
                <Text style={styles.servicePrice}>{currency(item.preco)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Combos</Text>
          {(profile?.combo_base ?? []).length ? (
            profile?.combo_base?.map((combo) => {
              const sizes = [
                combo.atende_casa_pequena && 'Pequena',
                combo.atende_casa_media && 'Média',
                combo.atende_casa_grande && 'Grande',
              ].filter(Boolean).join(', ');
              return (
                <View key={combo.id_combo_base} style={styles.comboCard}>
                  <View style={styles.comboHeader}>
                    <Text style={styles.comboName}>{combo.nome_combo}</Text>
                    <Text style={styles.comboPrice}>{currency(combo.valor_base)}</Text>
                  </View>
                  {combo.descricao ? <Text style={styles.comboDescription}>{combo.descricao}</Text> : null}
                  <Text style={styles.comboMeta}>Até {combo.qtd_comodos_casa} cômodos • {sizes || 'Tamanho não informado'}</Text>
                  <Text style={styles.comboServices}>
                    {(combo.combo_servico ?? []).map((item) => item.servico?.nome_servico).filter(Boolean).join(' • ') || 'Sem serviços vinculados'}
                  </Text>
                </View>
              );
            })
          ) : <Text style={styles.emptyText}>Nenhum combo cadastrado.</Text>}

          <Text style={styles.sectionTitle}>Localização da diarista</Text>
          <Text style={styles.infoText}>
            {profile?.endereco?.[0]
              ? `${profile.endereco[0].bairro} - ${profile.endereco[0].cidade}/${profile.endereco[0].estado}`
              : 'Localização não informada.'}
          </Text>

          <Text style={styles.sectionTitle}>Avaliações</Text>
          {(profile?.avaliacao ?? []).length ? (
            profile?.avaliacao?.map((item) => (
              <View key={item.id_avaliacao} style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>{item.autor ?? 'Cliente'} • {Number(item.nota).toFixed(1)}</Text>
                <Text style={styles.reviewText}>{item.comentario || 'Avaliação sem comentário.'}</Text>
              </View>
            ))
          ) : <Text style={styles.emptyText}>Ainda não há avaliações públicas.</Text>}

          <TouchableOpacity
  style={styles.scheduleButton}
  onPress={() => navigation.navigate('AgendarDiaria', { diaristaId })}
  activeOpacity={0.85}
>
  <Text style={styles.scheduleButtonText}>
    Agendar diária
  </Text>
</TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
