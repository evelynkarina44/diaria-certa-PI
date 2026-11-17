import { PageHeader } from '../../components/page-header';
import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles as baseStyles } from './styles';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { diaristaService } from '../../services/diaristaService';
import { getErrorMessage } from '../../services/api';
import type { Diarista } from '../../services/types';

export default function PerfilDiaristaScreen({
  navigation,
  route,
}: any) {
  const { desktop } = useResponsive();
  const styles = desktop ? { ...baseStyles,
    name: [baseStyles.name, baseStyles.desktopName],
    ratingRow: [baseStyles.ratingRow, baseStyles.desktopRating],
    ratingValue: [baseStyles.ratingValue, baseStyles.desktopRatingValue],
    ratingCount: [baseStyles.ratingCount, baseStyles.desktopRatingCount],
    sectionTitle: [baseStyles.sectionTitle, baseStyles.desktopSectionTitle],
    serviceButton: [baseStyles.serviceButton, baseStyles.desktopService],
    serviceText: [baseStyles.serviceText, baseStyles.desktopBody],
    aboutText: [baseStyles.aboutText, baseStyles.desktopBody],
    infoText: [baseStyles.infoText, baseStyles.desktopBody],
    reviewTitle: [baseStyles.reviewTitle, baseStyles.desktopReviewTitle],
    reviewText: [baseStyles.reviewText, baseStyles.desktopBody],
    emptyText: [baseStyles.emptyText, baseStyles.desktopBody],
    comboDescription: [baseStyles.comboDescription, baseStyles.desktopBody],
    comboName: [baseStyles.comboName, baseStyles.desktopReviewTitle],
    comboCard: [baseStyles.comboCard, baseStyles.desktopCombo],
    servicePrice: [baseStyles.servicePrice, baseStyles.desktopPrice],
    comboMeta: [baseStyles.comboMeta, baseStyles.desktopCaption],
    comboServices: [baseStyles.comboServices, baseStyles.desktopBody],
    scheduleButton: [baseStyles.scheduleButton, baseStyles.desktopSchedule],
    scheduleButtonText: [baseStyles.scheduleButtonText, baseStyles.desktopScheduleText],
  } : baseStyles;
  const [photoFailed, setPhotoFailed] = useState(false);
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
    setPhotoFailed(false);
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


  const photo = (<>{profile?.usuario?.foto_perfil && !photoFailed ? (
              <Image
                source={{ uri: profile.usuario.foto_perfil }}
                style={desktop ? baseStyles.desktopPhoto : styles.profileImage}
                onError={() => setPhotoFailed(true)}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={desktop ? 64 : 84} color="#D1D1D1" />
            )}</>);
  const identity = (<><Text style={styles.name}>
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
                size={desktop ? 16 : 19}
                color="#FFB800"
              />
            ))}

            <Text style={styles.ratingCount}>
              ({profile?.avaliacao?.length ?? 0} avaliações)
            </Text>
          </View></>);
  const about = (<><Text style={styles.sectionTitle}>
            Sobre
          </Text>

          <Text style={styles.aboutText}>
            {profile?.descricao ?? 'Descrição não informada.'}
          </Text></>);
  const services = (<><Text style={styles.sectionTitle}>
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
          </View></>);
  const combos = (<><Text style={styles.sectionTitle}>Combos</Text>
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
          ) : <Text style={styles.emptyText}>Nenhum combo cadastrado.</Text>}</>);
  const location = (<><Text style={styles.sectionTitle}>Localização da diarista</Text>
          <Text style={styles.infoText}>
            {profile?.endereco?.[0]
              ? `${profile.endereco[0].bairro} - ${profile.endereco[0].cidade}/${profile.endereco[0].estado}`
              : 'Localização não informada.'}
          </Text></>);
  const reviews = (<><Text style={styles.sectionTitle}>Avaliações</Text>
          {(profile?.avaliacao ?? []).length ? (
            profile?.avaliacao?.map((item) => (
              <View key={item.id_avaliacao} style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>{item.autor ?? 'Cliente'} • {Number(item.nota).toFixed(1)}</Text>
                <Text style={styles.reviewText}>{item.comentario || 'Avaliação sem comentário.'}</Text>
              </View>
            ))
          ) : <Text style={styles.emptyText}>Ainda não há avaliações públicas.</Text>}</>);
  const schedule = (<><TouchableOpacity
  style={styles.scheduleButton}
  onPress={() => navigation.navigate('AgendarDiaria', { diaristaId })}
  activeOpacity={0.85}
>
  <Text style={styles.scheduleButtonText}>
    Agendar diária
  </Text>
</TouchableOpacity></>);

  return (
    <SafeAreaView style={styles.safeArea}>
      {desktop && <PageHeader title="Perfil da diarista"
        subtitle="Conheça a profissional, seus serviços e avaliações." accentColor="#18C7C8"
        onBack={() => navigation.goBack()} allowBackWithSidebar compact />}
      <ScrollView style={[styles.scroll, desktop && baseStyles.desktopScroll]}
        contentContainerStyle={desktop ? baseStyles.desktopContent : styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {desktop ? (
          <>

            <View style={baseStyles.desktopHero}>
              <View style={baseStyles.desktopAvatar}>{photo}</View>
              <View style={baseStyles.desktopIdentity}>{identity}</View>
              <View style={baseStyles.desktopBooking}>{schedule}</View>
            </View>
            <View style={baseStyles.desktopColumns}>
              <View style={baseStyles.desktopMain}>
                <View style={baseStyles.desktopSection}>{about}</View>
                <View style={baseStyles.desktopSection}>{services}</View>
                <View style={baseStyles.desktopSection}>{combos}</View>
              </View>
              <View style={baseStyles.desktopAside}>
                <View style={baseStyles.desktopSection}>{location}</View>
                <View style={baseStyles.desktopSection}>{reviews}</View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.imageArea}>
              <View style={styles.imagePlaceholder}>{photo}</View>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}
                accessibilityRole="button" accessibilityLabel="Voltar" activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.contentCard}>
              {identity}{about}{services}{combos}{location}{reviews}{schedule}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
