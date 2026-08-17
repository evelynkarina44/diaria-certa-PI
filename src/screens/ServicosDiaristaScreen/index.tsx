import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HeaderMenu } from '../../components/header-menu';
import { ProfileEditModal } from '../../components/profile-edit-modal';
import { useAuth } from '../../contexts/GlobalContext';
import { diaristaService } from '../../services/diaristaService';
import { diaristaServicoService } from '../../services/diaristaServicoService';
import { servicoService } from '../../services/servicoService';
import { getErrorMessage } from '../../services/api';
import type { Diarista, DiaristaServico } from '../../services/types';
import { styles } from './styles';
import { formatCurrencyValue, parseCurrencyInput } from '../../utils/currency';

const serviceNamePattern = /^[\p{L}\p{N}\s.,:;&()'´’/\-]+$/u;
const invalidDescriptionCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function validateServiceName(value: string) {
  const name = value.trim();
  if (!name) return 'O nome do serviço é obrigatório.';
  if (name.length < 2) return 'Informe pelo menos 2 caracteres.';
  if (name.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  if (!serviceNamePattern.test(name)) return 'Use apenas letras, números e pontuação comum.';
  return null;
}

function validateDescription(value: string) {
  if (value.length > 2000) return 'A descrição deve ter no máximo 2.000 caracteres.';
  if (invalidDescriptionCharacters.test(value)) return 'A descrição contém caracteres não permitidos.';
  return null;
}

function validatePrice(value: string) {
  if (!value) return 'O preço é obrigatório.';
  const price = parseCurrencyInput(value);
  if (price <= 0) return 'O preço deve ser maior que zero.';
  if (price > 999999.99) return 'O preço máximo é R$ 999.999,99.';
  return null;
}

export default function ServicosDiaristaScreen({ navigation }: any) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [editingService, setEditingService] = useState<DiaristaServico | null>(null);

  const loadData = useCallback(async () => {
    const id = user?.diarista?.[0]?.id_diarista;
    if (!id) return setLoading(false);
    try {
      setProfile(await diaristaService.buscarPorId(id));
      setError('');
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const atuais = profile?.diarista_servico ?? [];
  const parseMoney = parseCurrencyInput;
  const currency = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  async function saveEdit(values: Record<string, string>) {
    if (!editingService) return;
    const nome = values.nome_servico.trim();
    if (nome.length < 2) throw new Error('Informe o nome do serviço.');
    const preco = parseMoney(values.preco);
    if (!preco || preco <= 0) throw new Error('Informe um preço válido.');
    await Promise.all([
      servicoService.atualizar(editingService.id_servico, {
        nome_servico: nome,
        descricao: values.descricao.trim() || null,
      }),
      diaristaServicoService.atualizar(editingService.id_diarista_servico, { preco }),
    ]);
    await loadData();
  }

  async function saveAdd(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    const nome = values.nome_servico.trim();
    if (nome.length < 2) throw new Error('Informe o nome do serviço.');
    const preco = parseMoney(values.preco);
    if (!preco || preco <= 0) throw new Error('Informe um preço válido.');
    const servico = await servicoService.criar({
      nome_servico: nome,
      descricao: values.descricao.trim() || null,
    });
    try {
      await diaristaServicoService.criar({
        id_diarista: profile.id_diarista,
        id_servico: servico.id_servico,
        preco,
        faz_parte_combo_base: false,
      });
    } catch (cause) {
      await servicoService.remover(servico.id_servico).catch(() => undefined);
      throw cause;
    }
    await loadData();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Meus serviços</Text>
          <Text style={styles.subtitle}>Gerencie os serviços oferecidos e seus preços.</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços cadastrados</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.addButton} onPress={() => setAddVisible(true)} accessibilityLabel="Adicionar serviço">
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? <ActivityIndicator color="#FF6B2C" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !atuais.length ? <View style={styles.emptyCard}><Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text></View> : null}
        {atuais.map((item) => (
          <View key={item.id_diarista_servico} style={styles.card}>
            <View style={styles.cardIcon}><Ionicons name="sparkles-outline" size={21} color="#FF6B2C" /></View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}</Text>
              {item.servico?.descricao ? <Text style={styles.cardDescription}>{item.servico.descricao}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <Text style={styles.price}>{currency(item.preco)}</Text>
              <TouchableOpacity style={styles.cardEditButton} onPress={() => setEditingService(item)} accessibilityLabel={`Editar ${item.servico?.nome_servico ?? 'serviço'}`}>
                <Ionicons name="pencil" size={14} color="#111111" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <ProfileEditModal
        visible={Boolean(editingService)} title="Editar serviço" accentColor="#FF6B2C"
        fields={[
          { name: 'nome_servico', label: 'Nome do serviço', placeholder: 'Ex.: Limpeza de janelas', maxLength: 100, validate: validateServiceName },
          { name: 'descricao', label: 'Descrição do serviço (opcional)', placeholder: 'Descreva o que está incluído', multiline: true, maxLength: 2000, validate: validateDescription },
          { name: 'preco', label: 'Preço', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad', validate: validatePrice, currency: true },
        ]}
        initialValues={{
          nome_servico: editingService?.servico?.nome_servico ?? '',
          descricao: editingService?.servico?.descricao ?? '',
          preco: formatCurrencyValue(editingService?.preco),
        }}
        onClose={() => setEditingService(null)} onSave={saveEdit}
      />
      <ProfileEditModal
        visible={addVisible} title="Adicionar serviço" accentColor="#FF6B2C"
        fields={[
          { name: 'nome_servico', label: 'Nome do serviço', placeholder: 'Ex.: Limpeza de janelas', maxLength: 100, validate: validateServiceName },
          { name: 'descricao', label: 'Descrição do serviço (opcional)', placeholder: 'Descreva o que está incluído', multiline: true, maxLength: 2000, validate: validateDescription },
          { name: 'preco', label: 'Preço', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad', validate: validatePrice, currency: true },
        ]}
        initialValues={{ nome_servico: '', descricao: '', preco: '' }}
        onClose={() => setAddVisible(false)} onSave={saveAdd}
      />
    </SafeAreaView>
  );
}
