import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { diaristaService } from '../../services/diaristaService';
import { enderecoService } from '../../services/enderecoService';
import type { Diarista, Endereco } from '../../services/types';
import { LogoutButton } from '../../components/logout-button';
import { ProfileAccessActions } from '../../components/profile-access-actions';
import { ProfileEditModal } from '../../components/profile-edit-modal';
import { usuarioService } from '../../services/usuarioService';

type EditSection =
  | 'photo'
  | 'professional'
  | 'about'
  | 'address'
  | null;

export default function PerfilDiaristaEdicaoScreen({
  navigation,
}: any) {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState<EditSection>(null);

  const loadProfile = useCallback(async () => {
    const diaristaId = user?.diarista?.[0]?.id_diarista;
    if (!diaristaId) {
      setLoading(false);
      return;
    }
    try {
      const [diarista, enderecos] = await Promise.all([
        diaristaService.buscarPorId(diaristaId),
        enderecoService.listar({ limit: 1 }),
      ]);
      setProfile(diarista);
      setEndereco(enderecos.data[0] ?? null);
    } catch {
      setProfile(null);
      setEndereco(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  const rating = Number(profile?.avaliacao_media ?? 0);
  function voltar() {
    navigation.goBack();
  }

  async function savePhoto(values: Record<string, string>) {
    if (!user?.id_usuario) return;
    await usuarioService.atualizar(user.id_usuario, { foto_perfil: values.foto_perfil.trim() });
    await Promise.all([refreshSession(), loadProfile()]);
  }

  async function saveAbout(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    await diaristaService.atualizar(profile.id_diarista, { descricao: values.descricao.trim() });
    await loadProfile();
  }

  async function saveProfessional(values: Record<string, string>) {
    if (!profile?.id_diarista || !user?.id_usuario) return;
    await Promise.all([
      diaristaService.atualizar(profile.id_diarista, {
        qtd_max_comodos: Number(values.qtd_max_comodos),
        frequencia_resposta: values.frequencia_resposta.trim() || null,
      }),
      usuarioService.atualizar(user.id_usuario, {
        email: values.email.trim(),
        telefone: values.telefone.trim(),
        cpf: values.cpf.replace(/\D/g, '') || null,
      }),
    ]);
    await Promise.all([refreshSession(), loadProfile()]);
  }

  async function saveAddress(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    const data = {
      bairro: values.bairro.trim(),
      cep: values.cep.trim(),
      logradouro: values.logradouro.trim(),
      numero: Number(values.numero),
      complemento: values.complemento.trim() || null,
      cidade: values.cidade.trim(),
      estado: values.estado.trim().toUpperCase(),
      referencia: values.referencia.trim() || null,
    };
    if (endereco?.id_endereco) {
      await enderecoService.atualizar(endereco.id_endereco, data);
    } else {
      await enderecoService.criar({ ...data, id_diarista: profile.id_diarista });
    }
    await loadProfile();
  }

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color="#FF6B2C" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOPO LARANJA */}
        <View style={styles.topBackground}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={voltar}
            activeOpacity={0.8}
            accessibilityLabel="Voltar"
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          {/* PERFIL */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {user?.foto_perfil ? (
                <Image source={{ uri: user.foto_perfil }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={65} color="#FFFFFF" />
              )}

              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={() => setEditSection('photo')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pencil"
                  size={13}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {user?.nome ?? 'Diarista'}
              </Text>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>
                  {rating.toFixed(1)}
                </Text>

                {[1, 2, 3, 4, 5].map((item) => (
                  <Ionicons key={item} name={rating >= item ? 'star' : 'star-outline'} size={15} color="#FFB800" />
                ))}

                <Text style={styles.ratingCount}>
                  ({profile?.avaliacao?.length ?? 0} avaliações públicas)
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('HistoricoDiarista')
                }
              >
                <Text style={styles.historyText}>
                  Ver histórico
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dados profissionais</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditSection('professional')} activeOpacity={0.7} accessibilityLabel="Editar dados profissionais">
                <Ionicons name="pencil" size={14} color="#111111" />
              </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>Máximo de cômodos: {profile?.qtd_max_comodos ?? 'Não informado'}</Text>
              <Text style={styles.aboutText}>Frequência de resposta: {profile?.frequencia_resposta || 'Não informada'}</Text>
              <Text style={styles.aboutText}>E-mail: {user?.email ?? 'Não informado'}</Text>
              <Text style={styles.aboutText}>Telefone: {user?.telefone ?? 'Não informado'}</Text>
              <Text style={styles.aboutText}>CPF: {user?.cpf ?? 'Não informado'}</Text>
            </View>
          </View>

          {/* SOBRE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Sobre
              </Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditSection('about')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                {profile?.descricao ?? 'Descrição não informada.'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Endereço de atendimento</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditSection('address')} activeOpacity={0.7} accessibilityLabel="Editar endereço de atendimento">
                <Ionicons name="pencil" size={14} color="#111111" />
              </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>{endereco ? `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ` - ${endereco.complemento}` : ''}` : 'Endereço não informado.'}</Text>
              {endereco ? <Text style={styles.aboutText}>{endereco.bairro} - {endereco.cidade}/{endereco.estado} - CEP {endereco.cep}</Text> : null}
            </View>
          </View>

          {/* BOTÃO SAIR DA CONTA */}
          <ProfileAccessActions navigation={navigation} />
          <LogoutButton
            navigation={navigation}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      <ProfileEditModal
        visible={editSection === 'photo'}
        title="Editar foto"
        accentColor="#FF6B2C"
        fields={[{ name: 'foto_perfil', label: 'URL da foto', placeholder: 'https://...', keyboardType: 'url' }]}
        initialValues={{ foto_perfil: user?.foto_perfil ?? '' }}
        onClose={() => setEditSection(null)}
        onSave={savePhoto}
      />
      <ProfileEditModal
        visible={editSection === 'professional'}
        title="Editar dados profissionais"
        accentColor="#FF6B2C"
        fields={[
          { name: 'qtd_max_comodos', label: 'Máximo de cômodos', keyboardType: 'number-pad' },
          { name: 'frequencia_resposta', label: 'Frequência de resposta', placeholder: 'Ex.: Em até 1 hora' },
          { name: 'email', label: 'E-mail', keyboardType: 'email-address' },
          { name: 'telefone', label: 'Telefone', keyboardType: 'phone-pad' },
          { name: 'cpf', label: 'CPF', keyboardType: 'number-pad', maxLength: 14 },
        ]}
        initialValues={{
          qtd_max_comodos: String(profile?.qtd_max_comodos ?? ''),
          frequencia_resposta: profile?.frequencia_resposta ?? '',
          email: user?.email ?? '',
          telefone: user?.telefone ?? '',
          cpf: user?.cpf ?? '',
        }}
        onClose={() => setEditSection(null)}
        onSave={saveProfessional}
      />
      <ProfileEditModal
        visible={editSection === 'about'}
        title="Editar sobre"
        accentColor="#FF6B2C"
        fields={[{ name: 'descricao', label: 'Conte sobre você', multiline: true, maxLength: 2000 }]}
        initialValues={{ descricao: profile?.descricao ?? '' }}
        onClose={() => setEditSection(null)}
        onSave={saveAbout}
      />
      <ProfileEditModal
        visible={editSection === 'address'}
        title="Editar endereço"
        accentColor="#FF6B2C"
        addressAutoFill
        fields={[
          { name: 'cep', label: 'CEP', placeholder: '00000-000', keyboardType: 'number-pad', maxLength: 9 },
          { name: 'logradouro', label: 'Logradouro', placeholder: 'Rua, avenida...' },
          { name: 'numero', label: 'Número', keyboardType: 'number-pad' },
          { name: 'complemento', label: 'Complemento', placeholder: 'Apartamento, bloco...' },
          { name: 'bairro', label: 'Bairro' },
          { name: 'cidade', label: 'Cidade' },
          { name: 'estado', label: 'Estado', placeholder: 'SP', maxLength: 2 },
          { name: 'referencia', label: 'Referência', placeholder: 'Próximo a...' },
        ]}
        initialValues={{
          cep: endereco?.cep ?? '',
          logradouro: endereco?.logradouro ?? '',
          numero: String(endereco?.numero ?? ''),
          complemento: endereco?.complemento ?? '',
          bairro: endereco?.bairro ?? '',
          cidade: endereco?.cidade ?? '',
          estado: endereco?.estado ?? '',
          referencia: endereco?.referencia ?? '',
        }}
        onClose={() => setEditSection(null)}
        onSave={saveAddress}
      />
    </SafeAreaView>
  );
}
