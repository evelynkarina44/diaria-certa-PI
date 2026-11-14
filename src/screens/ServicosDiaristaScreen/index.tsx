import { PageHeader } from '../../components/page-header';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const SERVICES_PER_PAGE = 10;
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

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
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  function changeSearch(value: string) { setSearch(value); setPage(1); }
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
  const terms = normalizeSearch(search).trim().split(/\s+/).filter(Boolean);
  const filteredServices = atuais.filter(item => {
    const text = normalizeSearch([item.servico?.nome_servico ?? '', item.servico?.descricao ?? ''].join(' '));
    return terms.every(term => text.includes(term));
  });
  const pages = Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE));
  const currentPage = Math.min(page, pages);
  const visibleServices = filteredServices.slice((currentPage - 1) * SERVICES_PER_PAGE, currentPage * SERVICES_PER_PAGE);
  useEffect(() => { setPage(1); }, [user?.diarista?.[0]?.id_diarista]);
  useEffect(() => { setPage(current => Math.min(current, pages)); }, [pages]);
  function changePage(nextPage: number) {
    setPage(Math.max(1, Math.min(nextPage, pages)));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }
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
      <PageHeader title="Meus serviços" subtitle="Gerencie os serviços oferecidos e seus preços." accentColor="#FF6B2C" left={<HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />} />

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços cadastrados</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.addButton} onPress={() => setAddVisible(true)} accessibilityLabel="Adicionar serviço">
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#667085" />
          <TextInput style={styles.searchInput} value={search} onChangeText={changeSearch}
            placeholder="Buscar serviço por nome ou descrição" placeholderTextColor="#98A2B3"
            accessibilityLabel="Buscar serviços" autoCorrect={false} returnKeyType="search" />
          {Boolean(search) && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpar busca de serviços"
            onPress={() => changeSearch('')} style={styles.clearSearch}><Ionicons name="close-circle" size={20} color="#98A2B3" /></TouchableOpacity>}
        </View>

        {loading ? <ActivityIndicator color="#FF6B2C" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !filteredServices.length ? <View style={styles.emptyCard}><Text style={styles.emptyText}>{atuais.length ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado.'}</Text></View> : null}
        {visibleServices.map((item) => (
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
        {pages > 1 && <View style={styles.pagination}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Página anterior de serviços"
            disabled={currentPage === 1} onPress={() => changePage(currentPage - 1)}
            style={[styles.pageButton, currentPage === 1 && styles.disabled]}>
            <Ionicons name="chevron-back" size={18} color="#E55318" /><Text style={styles.pageButtonText}>Anterior</Text>
          </TouchableOpacity>
          <Text accessibilityLiveRegion="polite" style={styles.pageIndicator}>Página {currentPage} de {pages}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próxima página de serviços"
            disabled={currentPage === pages} onPress={() => changePage(currentPage + 1)}
            style={[styles.pageButton, currentPage === pages && styles.disabled]}>
            <Text style={styles.pageButtonText}>Próxima</Text><Ionicons name="chevron-forward" size={18} color="#E55318" />
          </TouchableOpacity>
        </View>}
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
