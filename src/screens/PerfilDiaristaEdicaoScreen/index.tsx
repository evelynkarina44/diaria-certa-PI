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
import type { Diarista, Endereco, Servico } from '../../services/types';
import { LogoutButton } from '../../components/logout-button';
import { ProfileAccessActions } from '../../components/profile-access-actions';
import { ProfileEditModal, type ProfileEditField } from '../../components/profile-edit-modal';
import { usuarioService } from '../../services/usuarioService';
import { diaristaServicoService } from '../../services/diaristaServicoService';
import { servicoService } from '../../services/servicoService';
import { comboBaseService } from '../../services/comboBaseService';
import { comboServicoService } from '../../services/comboServicoService';

type EditSection =
  | 'photo'
  | 'professional'
  | 'about'
  | 'services'
  | 'addService'
  | 'combos'
  | 'addCombo'
  | 'address'
  | null;

export default function PerfilDiaristaEdicaoScreen({
  navigation,
}: any) {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [catalogo, setCatalogo] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState<EditSection>(null);

  const loadProfile = useCallback(async () => {
    const diaristaId = user?.diarista?.[0]?.id_diarista;
    if (!diaristaId) {
      setLoading(false);
      return;
    }
    try {
      const [diarista, enderecos, servicos] = await Promise.all([
        diaristaService.buscarPorId(diaristaId),
        enderecoService.listar({ limit: 1 }),
        servicoService.listar({ limit: 100 }),
      ]);
      setProfile(diarista);
      setEndereco(enderecos.data[0] ?? null);
      setCatalogo(servicos);
    } catch {
      setProfile(null);
      setEndereco(null);
      setCatalogo([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  const currency = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const parseMoney = (value: string) => Number(value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  const selectedIds = (value = '') => value.split(',').filter(Boolean).map(Number);
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

  async function saveServices(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    const updates = (profile.diarista_servico ?? [])
      .filter((item) => values[`preco_${item.id_diarista_servico}`])
      .map((item) => diaristaServicoService.atualizar(item.id_diarista_servico, {
        preco: parseMoney(values[`preco_${item.id_diarista_servico}`]),
      }));
    await Promise.all(updates);
    await loadProfile();
  }

  async function saveAddService(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    if (!values.id_servico) throw new Error('Selecione um serviço.');
    if (!values.preco || parseMoney(values.preco) <= 0) throw new Error('Informe um preço válido.');
    await diaristaServicoService.criar({
      id_diarista: profile.id_diarista,
      id_servico: Number(values.id_servico),
      preco: parseMoney(values.preco),
      faz_parte_combo_base: false,
    });
    await loadProfile();
  }

  async function syncComboServices(idCombo: number, selected: number[], current: NonNullable<Diarista['combo_base']>[number]['combo_servico'] = []) {
    const currentIds = current.map((item) => item.id_servico);
    await Promise.all([
      ...selected.filter((id) => !currentIds.includes(id)).map((id_servico) => comboServicoService.criar({ id_combo_base: idCombo, id_servico })),
      ...current.filter((item) => !selected.includes(item.id_servico)).map((item) => comboServicoService.remover(item.id_combo_servico)),
    ]);
  }

  async function saveCombos(values: Record<string, string>) {
    const combos = profile?.combo_base ?? [];
    await Promise.all(combos.map(async (combo) => {
      const prefix = `combo_${combo.id_combo_base}`;
      const tamanhos = (values[`${prefix}_tamanhos`] ?? '').split(',').filter(Boolean);
      const services = selectedIds(values[`${prefix}_servicos`]);
      if (!services.length) throw new Error(`Selecione ao menos um serviço para ${combo.nome_combo}.`);
      await comboBaseService.atualizar(combo.id_combo_base, {
        nome_combo: values[`${prefix}_nome`].trim(),
        descricao: values[`${prefix}_descricao`].trim() || null,
        valor_base: parseMoney(values[`${prefix}_valor`]),
        qtd_comodos_casa: Number(values[`${prefix}_comodos`]),
        atende_casa_pequena: tamanhos.includes('pequena'),
        atende_casa_media: tamanhos.includes('media'),
        atende_casa_grande: tamanhos.includes('grande'),
      });
      await syncComboServices(combo.id_combo_base, services, combo.combo_servico);
    }));
    await loadProfile();
  }

  async function saveAddCombo(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    const services = selectedIds(values.servicos);
    const tamanhos = (values.tamanhos ?? '').split(',').filter(Boolean);
    if (!services.length) throw new Error('Selecione ao menos um serviço para o combo.');
    if (!tamanhos.length) throw new Error('Selecione ao menos um tamanho de residência.');
    const combo = await comboBaseService.criar({
      id_diarista: profile.id_diarista,
      nome_combo: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      valor_base: parseMoney(values.valor),
      qtd_comodos_casa: Number(values.comodos),
      atende_casa_pequena: tamanhos.includes('pequena'),
      atende_casa_media: tamanhos.includes('media'),
      atende_casa_grande: tamanhos.includes('grande'),
    });
    await syncComboServices(combo.id_combo_base, services);
    await loadProfile();
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

  const servicosAtuais = profile?.diarista_servico ?? [];
  const idsAtuais = new Set(servicosAtuais.map((item) => item.id_servico));
  const novosServicos = catalogo.filter((item) => !idsAtuais.has(item.id_servico));
  const serviceFields: ProfileEditField[] = [
    ...servicosAtuais.map((item) => ({
      name: `preco_${item.id_diarista_servico}`,
      label: `${item.servico?.nome_servico ?? `Serviço #${item.id_servico}`} — preço`,
      keyboardType: 'decimal-pad' as const,
    })),
  ];
  const offeredServiceOptions = servicosAtuais.map((item) => ({
    label: item.servico?.nome_servico ?? `Serviço #${item.id_servico}`,
    value: String(item.id_servico),
  }));
  const residenceSizeOptions = [
    { label: 'Pequena', value: 'pequena' },
    { label: 'Média', value: 'media' },
    { label: 'Grande', value: 'grande' },
  ];
  const comboFields: ProfileEditField[] = (profile?.combo_base ?? []).flatMap((combo) => {
    const prefix = `combo_${combo.id_combo_base}`;
    return [
      { name: `${prefix}_nome`, label: `${combo.nome_combo} — nome` },
      { name: `${prefix}_descricao`, label: 'Descrição', multiline: true },
      { name: `${prefix}_valor`, label: 'Valor total', keyboardType: 'decimal-pad' as const },
      { name: `${prefix}_comodos`, label: 'Limite de cômodos', keyboardType: 'number-pad' as const },
      { name: `${prefix}_tamanhos`, label: 'Tamanhos de residência', options: residenceSizeOptions, multiple: true },
      { name: `${prefix}_servicos`, label: 'Serviços incluídos', options: offeredServiceOptions, multiple: true },
    ];
  });
  const comboInitialValues = Object.fromEntries((profile?.combo_base ?? []).flatMap((combo) => {
    const prefix = `combo_${combo.id_combo_base}`;
    const tamanhos = [
      combo.atende_casa_pequena ? 'pequena' : '',
      combo.atende_casa_media ? 'media' : '',
      combo.atende_casa_grande ? 'grande' : '',
    ].filter(Boolean).join(',');
    return [
      [`${prefix}_nome`, combo.nome_combo],
      [`${prefix}_descricao`, combo.descricao ?? ''],
      [`${prefix}_valor`, String(combo.valor_base).replace('.', ',')],
      [`${prefix}_comodos`, String(combo.qtd_comodos_casa)],
      [`${prefix}_tamanhos`, tamanhos],
      [`${prefix}_servicos`, (combo.combo_servico ?? []).map((item) => item.id_servico).join(',')],
    ];
  }));

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

          {/* SERVIÇOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Serviços
              </Text>

              <View style={styles.sectionActions}>
                <TouchableOpacity
                  style={[styles.editButton, !servicosAtuais.length && styles.disabledButton]}
                  onPress={() => setEditSection('services')}
                  disabled={!servicosAtuais.length}
                  activeOpacity={0.7}
                  accessibilityLabel="Editar serviços"
                >
                  <Ionicons name="pencil" size={14} color="#111111" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, !novosServicos.length && styles.disabledButton]}
                  onPress={() => setEditSection('addService')}
                  disabled={!novosServicos.length}
                  activeOpacity={0.7}
                  accessibilityLabel="Adicionar serviço"
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.servicesCard}>
              {(profile?.diarista_servico ?? []).map((item) => (
                <View key={item.id_diarista_servico} style={styles.serviceDataRow}>
                  <Text style={styles.serviceDataName}>{item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}</Text>
                  <Text style={styles.serviceDataPrice}>{currency(item.preco)}</Text>
                </View>
              ))}
              {!profile?.diarista_servico?.length ? <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text> : null}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Combos</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity
                  style={[styles.editButton, !profile?.combo_base?.length && styles.disabledButton]}
                  onPress={() => setEditSection('combos')}
                  disabled={!profile?.combo_base?.length}
                  activeOpacity={0.7}
                  accessibilityLabel="Editar combos"
                >
                  <Ionicons name="pencil" size={14} color="#111111" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, !servicosAtuais.length && styles.disabledButton]}
                  onPress={() => setEditSection('addCombo')}
                  disabled={!servicosAtuais.length}
                  activeOpacity={0.7}
                  accessibilityLabel="Adicionar combo"
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            {(profile?.combo_base ?? []).map((combo) => (
              <View key={combo.id_combo_base} style={styles.comboCard}>
                <View style={styles.serviceDataRow}>
                  <Text style={styles.serviceDataName}>{combo.nome_combo}</Text>
                  <Text style={styles.serviceDataPrice}>{currency(combo.valor_base)}</Text>
                </View>
                {combo.descricao ? <Text style={styles.aboutText}>{combo.descricao}</Text> : null}
                <Text style={styles.comboMeta}>Até {combo.qtd_comodos_casa} cômodos</Text>
                <Text style={styles.comboMeta}>{(combo.combo_servico ?? []).map((item) => item.servico?.nome_servico).filter(Boolean).join(' • ')}</Text>
              </View>
            ))}
            {!profile?.combo_base?.length ? <Text style={styles.emptyText}>Nenhum combo cadastrado.</Text> : null}
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
        visible={editSection === 'services'}
        title="Editar serviços"
        accentColor="#FF6B2C"
        fields={serviceFields}
        initialValues={{
          ...Object.fromEntries(servicosAtuais.map((item) => [`preco_${item.id_diarista_servico}`, String(item.preco).replace('.', ',')])),
        }}
        onClose={() => setEditSection(null)}
        onSave={saveServices}
      />
      <ProfileEditModal
        visible={editSection === 'addService'}
        title="Adicionar serviço"
        accentColor="#FF6B2C"
        fields={[
          { name: 'id_servico', label: 'Serviço', options: novosServicos.map((item) => ({ label: item.nome_servico, value: String(item.id_servico) })) },
          { name: 'preco', label: 'Preço', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad' },
        ]}
        initialValues={{ id_servico: '', preco: '' }}
        onClose={() => setEditSection(null)}
        onSave={saveAddService}
      />
      <ProfileEditModal
        visible={editSection === 'combos'}
        title="Editar combos"
        accentColor="#FF6B2C"
        fields={comboFields}
        initialValues={comboInitialValues}
        onClose={() => setEditSection(null)}
        onSave={saveCombos}
      />
      <ProfileEditModal
        visible={editSection === 'addCombo'}
        title="Adicionar combo base"
        accentColor="#FF6B2C"
        fields={[
          { name: 'nome', label: 'Nome do combo' },
          { name: 'descricao', label: 'Descrição', multiline: true },
          { name: 'valor', label: 'Valor total', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad' },
          { name: 'comodos', label: 'Limite de cômodos', keyboardType: 'number-pad' },
          { name: 'tamanhos', label: 'Tamanhos de residência', options: residenceSizeOptions, multiple: true },
          { name: 'servicos', label: 'Serviços incluídos', options: offeredServiceOptions, multiple: true },
        ]}
        initialValues={{ nome: '', descricao: '', valor: '', comodos: '', tamanhos: '', servicos: '' }}
        onClose={() => setEditSection(null)}
        onSave={saveAddCombo}
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
