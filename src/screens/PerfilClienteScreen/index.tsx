import { PageHeader } from '../../components/page-header';
import React, { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { clienteService } from '../../services/clienteService';
import { getErrorMessage } from '../../services/api';
import type { Cliente } from '../../services/types';
import { LogoutButton } from '../../components/logout-button';
import { ProfileAccessActions } from '../../components/profile-access-actions';
import { ProfileEditModal } from '../../components/profile-edit-modal';
import { ProfilePhotoModal } from '../../components/profile-photo-modal';
import { usuarioService } from '../../services/usuarioService';
import { ClientHouses } from '../../components/client-houses';

type EditSection = 'photo' | 'personal' | null;

export default function PerfilClienteScreen({ navigation }: any) {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editSection, setEditSection] = useState<EditSection>(null);

  const loadProfile = useCallback(async () => {
    const clienteId = user?.cliente?.[0]?.id_cliente;
    if (!clienteId) {
      setLoading(false);
      return;
    }
    try {
      setProfile(await clienteService.buscarPorId(clienteId));
      setError('');
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const profileUser = profile?.usuario ?? user;
  const avaliacoes = profile?.avaliacao ?? [];
  const rating = avaliacoes.length
    ? avaliacoes.reduce((total, avaliacao) => total + Number(avaliacao.nota), 0) / avaliacoes.length
    : 0;
  const nascimento = profile?.data_nascimento
    ? new Date(profile.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : 'Não informado';

  async function savePersonal(values: Record<string, string>) {
    if (!profileUser?.id_usuario || !profile?.id_cliente) return;
    await Promise.all([
      usuarioService.atualizar(profileUser.id_usuario, {
        nome: values.nome.trim(),
        email: values.email.trim(),
        telefone: values.telefone.trim(),
        cpf: values.cpf.replace(/\D/g, '') || null,
      }),
      clienteService.atualizar(profile.id_cliente, { data_nascimento: values.data_nascimento }),
    ]);
    await Promise.all([refreshSession(), loadProfile()]);
  }

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color="#18C7C8" /></SafeAreaView>;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader onBack={() => navigation.goBack()} bottomSpace={20} />

        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {profileUser?.foto_perfil ? (
                <Image source={{ uri: profileUser.foto_perfil }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={65} color="#FFFFFF" />
              )}

              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={() => setEditSection('photo')}
                activeOpacity={0.7}
                accessibilityLabel="Editar foto do perfil"
              >
                <Ionicons name="pencil" size={13} color="#111111" />
              </TouchableOpacity>
            </View>

          <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {profileUser?.nome ?? 'Cliente'}
                </Text>

              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Ionicons
                    key={item}
                    name={rating >= item ? 'star' : 'star-outline'}
                    size={15}
                    color="#FFB800"
                  />
                ))}
                <Text style={styles.ratingCount}>
                  ({avaliacoes.length} avaliações públicas)
                </Text>
              </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HistoricoCliente')
              }
              activeOpacity={0.7}
            >
              <View style={styles.historyRow}>
                <Text style={styles.historyText}>
                  Ver histórico
                </Text>

                <Ionicons
                  name="search-outline"
                  size={14}
                  color="#8F8F8F"
                />
              </View>
            </TouchableOpacity>
            </View>
          </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.detailsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Dados pessoais</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditSection('personal')} activeOpacity={0.7} accessibilityLabel="Editar dados pessoais">
              <Ionicons name="pencil" size={14} color="#111111" />
            </TouchableOpacity>
          </View>
          <Text style={styles.detailText}>E-mail: {profileUser?.email ?? 'Não informado'}</Text>
          <Text style={styles.detailText}>Telefone: {profileUser?.telefone ?? 'Não informado'}</Text>
          <Text style={styles.detailText}>CPF: {profileUser?.cpf ?? 'Não informado'}</Text>
          <Text style={styles.detailText}>Data de nascimento: {nascimento}</Text>
        </View>

        <ClientHouses cliente={profile} onUpdated={loadProfile} />

        <ProfileAccessActions
          navigation={navigation}
          style={styles.profileAccessButton}
        />
        <LogoutButton
          navigation={navigation}
          style={styles.logoutButton}
        />
        </View>
      </ScrollView>

      <ProfilePhotoModal
        visible={editSection === 'photo'}
        accentColor="#18C7C8"
        imageUrl={profileUser?.foto_perfil}
        onClose={() => setEditSection(null)}
        onSaved={async () => { await Promise.all([refreshSession(), loadProfile()]); }}
      />
      <ProfileEditModal
        visible={editSection === 'personal'}
        title="Editar dados pessoais"
        accentColor="#18C7C8"
        fields={[
          { name: 'nome', label: 'Nome completo' },
          { name: 'email', label: 'E-mail', keyboardType: 'email-address' },
          { name: 'telefone', label: 'Telefone', keyboardType: 'phone-pad' },
          { name: 'cpf', label: 'CPF', keyboardType: 'number-pad', maxLength: 14 },
          { name: 'data_nascimento', label: 'Data de nascimento', placeholder: 'AAAA-MM-DD' },
        ]}
        initialValues={{
          nome: profileUser?.nome ?? '',
          email: profileUser?.email ?? '',
          telefone: profileUser?.telefone ?? '',
          cpf: profileUser?.cpf ?? '',
          data_nascimento: profile?.data_nascimento?.slice(0, 10) ?? '',
        }}
        onClose={() => setEditSection(null)}
        onSave={savePersonal}
      />
    </SafeAreaView>
  );
}
