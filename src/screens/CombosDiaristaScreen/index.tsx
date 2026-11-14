import { PageHeader } from '../../components/page-header';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HeaderMenu } from '../../components/header-menu';
import { ProfileEditModal } from '../../components/profile-edit-modal';
import { useAuth } from '../../contexts/GlobalContext';
import { diaristaService } from '../../services/diaristaService';
import { comboBaseService } from '../../services/comboBaseService';
import { comboServicoService } from '../../services/comboServicoService';
import { getErrorMessage } from '../../services/api';
import type { ComboBase, Diarista } from '../../services/types';
import { styles } from './styles';
import { formatCurrencyValue, parseCurrencyInput } from '../../utils/currency';

const COMBOS_PER_PAGE = 5;
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const sizeOptions = [
  { label: 'Pequena', value: 'pequena' },
  { label: 'Média', value: 'media' },
  { label: 'Grande', value: 'grande' },
];

export default function CombosDiaristaScreen({ navigation }: any) {
  const { user } = useAuth();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  function changeSearch(value: string) { setSearch(value); setPage(1); }
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboBase | null>(null);

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

  const combos = profile?.combo_base ?? [];
  const terms = normalizeSearch(search).trim().split(/\s+/).filter(Boolean);
  const filteredCombos = combos.filter(combo => {
    const text = normalizeSearch([combo.nome_combo, combo.descricao ?? ''].join(' '));
    return terms.every(term => text.includes(term));
  });
  const pages = Math.max(1, Math.ceil(filteredCombos.length / COMBOS_PER_PAGE));
  const currentPage = Math.min(page, pages);
  const visibleCombos = filteredCombos.slice((currentPage - 1) * COMBOS_PER_PAGE, currentPage * COMBOS_PER_PAGE);
  useEffect(() => { setPage(1); }, [user?.diarista?.[0]?.id_diarista]);
  useEffect(() => { setPage(current => Math.min(current, pages)); }, [pages]);
  function changePage(nextPage: number) {
    setPage(Math.max(1, Math.min(nextPage, pages)));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }
  const servicos = profile?.diarista_servico ?? [];
  const serviceOptions = servicos.map((item) => ({
    label: item.servico?.nome_servico ?? `Serviço #${item.id_servico}`,
    value: String(item.id_servico),
  }));
  const parseMoney = parseCurrencyInput;
  const selectedIds = (value = '') => value.split(',').filter(Boolean).map(Number);
  const currency = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  async function syncServices(idCombo: number, selected: number[], current: NonNullable<Diarista['combo_base']>[number]['combo_servico'] = []) {
    const currentIds = current.map((item) => item.id_servico);
    await Promise.all([
      ...selected.filter((id) => !currentIds.includes(id)).map((id_servico) => comboServicoService.criar({ id_combo_base: idCombo, id_servico })),
      ...current.filter((item) => !selected.includes(item.id_servico)).map((item) => comboServicoService.remover(item.id_combo_servico)),
    ]);
  }

  async function saveEdit(values: Record<string, string>) {
    if (!editingCombo) return;
    const tamanhos = (values.tamanhos ?? '').split(',').filter(Boolean);
    const selected = selectedIds(values.servicos);
    if (!selected.length) throw new Error('Selecione ao menos um serviço para o combo.');
    if (!tamanhos.length) throw new Error('Selecione ao menos um tamanho de residência.');
    await comboBaseService.atualizar(editingCombo.id_combo_base, {
      nome_combo: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      valor_base: parseMoney(values.valor),
      qtd_comodos_casa: Number(values.comodos),
      atende_casa_pequena: tamanhos.includes('pequena'),
      atende_casa_media: tamanhos.includes('media'),
      atende_casa_grande: tamanhos.includes('grande'),
    });
    await syncServices(editingCombo.id_combo_base, selected, editingCombo.combo_servico);
    await loadData();
  }

  async function saveAdd(values: Record<string, string>) {
    if (!profile?.id_diarista) return;
    const selected = selectedIds(values.servicos);
    const tamanhos = (values.tamanhos ?? '').split(',').filter(Boolean);
    if (!selected.length) throw new Error('Selecione ao menos um serviço para o combo.');
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
    await syncServices(combo.id_combo_base, selected);
    await loadData();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title="Meus combos" subtitle="Crie pacotes usando os serviços que você oferece." accentColor="#FF6B2C" left={<HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />} />

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Combos base</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.addButton, !servicos.length && styles.disabled]} onPress={() => setAddVisible(true)} disabled={!servicos.length} accessibilityLabel="Adicionar combo">
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#667085" />
          <TextInput style={styles.searchInput} value={search} onChangeText={changeSearch}
            placeholder="Buscar combo por nome ou descrição" placeholderTextColor="#98A2B3"
            accessibilityLabel="Buscar combos" autoCorrect={false} returnKeyType="search" />
          {Boolean(search) && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpar busca de combos"
            onPress={() => changeSearch('')} style={styles.clearSearch}><Ionicons name="close-circle" size={20} color="#98A2B3" /></TouchableOpacity>}
        </View>
        {!servicos.length && !loading ? <Text style={styles.warning}>Cadastre ao menos um serviço antes de criar um combo.</Text> : null}
        {loading ? <ActivityIndicator color="#FF6B2C" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !filteredCombos.length ? <View style={styles.emptyCard}><Text style={styles.emptyText}>{combos.length ? 'Nenhum combo encontrado.' : 'Nenhum combo cadastrado.'}</Text></View> : null}
        {visibleCombos.map((combo) => (
          <View key={combo.id_combo_base} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeading}>
                <Text style={styles.cardTitle}>{combo.nome_combo}</Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.price}>{currency(combo.valor_base)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.cardEditButton} onPress={() => setEditingCombo(combo)} accessibilityLabel={`Editar ${combo.nome_combo}`}>
                <Ionicons name="pencil" size={14} color="#111111" />
              </TouchableOpacity>
            </View>
            {combo.descricao ? <Text style={styles.description}>{combo.descricao}</Text> : null}

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailBadge}>
                <Ionicons name="grid-outline" size={15} color="#FF6B2C" />
                <Text style={styles.detailText}>Até {combo.qtd_comodos_casa} cômodos</Text>
              </View>
              <View style={styles.detailBadge}>
                <Ionicons name="home-outline" size={15} color="#FF6B2C" />
                <Text style={styles.detailText}>
                  {[
                    combo.atende_casa_pequena ? 'Pequena' : '',
                    combo.atende_casa_media ? 'Média' : '',
                    combo.atende_casa_grande ? 'Grande' : '',
                  ].filter(Boolean).join(', ') || 'Tamanho não informado'}
                </Text>
              </View>
            </View>

            <Text style={styles.servicesLabel}>Serviços incluídos</Text>
            <View style={styles.serviceChips}>
              {(combo.combo_servico ?? []).map((item) => (
                <View key={item.id_combo_servico} style={styles.serviceChip}>
                  <Ionicons name="checkmark" size={13} color="#C74C18" />
                  <Text style={styles.serviceChipText}>{item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}</Text>
                </View>
              ))}
              {!combo.combo_servico?.length ? <Text style={styles.emptyServices}>Nenhum serviço vinculado</Text> : null}
            </View>
          </View>
        ))}
        {pages > 1 && <View style={styles.pagination}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Página anterior de combos"
            disabled={currentPage === 1} onPress={() => changePage(currentPage - 1)}
            style={[styles.pageButton, currentPage === 1 && styles.disabled]}>
            <Ionicons name="chevron-back" size={18} color="#E55318" /><Text style={styles.pageButtonText}>Anterior</Text>
          </TouchableOpacity>
          <Text accessibilityLiveRegion="polite" style={styles.pageIndicator}>Página {currentPage} de {pages}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próxima página de combos"
            disabled={currentPage === pages} onPress={() => changePage(currentPage + 1)}
            style={[styles.pageButton, currentPage === pages && styles.disabled]}>
            <Text style={styles.pageButtonText}>Próxima</Text><Ionicons name="chevron-forward" size={18} color="#E55318" />
          </TouchableOpacity>
        </View>}
      </ScrollView>

      <ProfileEditModal
        visible={Boolean(editingCombo)} title="Editar combo" accentColor="#FF6B2C"
        fields={[
          { name: 'nome', label: 'Nome do combo', maxLength: 100 },
          { name: 'descricao', label: 'Descrição', multiline: true, maxLength: 2000 },
          { name: 'valor', label: 'Valor total', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad', currency: true },
          { name: 'comodos', label: 'Limite de cômodos', keyboardType: 'number-pad' },
          { name: 'tamanhos', label: 'Tamanhos de residência', options: sizeOptions, multiple: true },
          { name: 'servicos', label: 'Serviços incluídos', options: serviceOptions, multiple: true, multiplePicker: true, selectionPlaceholder: 'Selecionar serviços' },
        ]}
        initialValues={{
          nome: editingCombo?.nome_combo ?? '',
          descricao: editingCombo?.descricao ?? '',
          valor: formatCurrencyValue(editingCombo?.valor_base),
          comodos: String(editingCombo?.qtd_comodos_casa ?? ''),
          tamanhos: [editingCombo?.atende_casa_pequena ? 'pequena' : '', editingCombo?.atende_casa_media ? 'media' : '', editingCombo?.atende_casa_grande ? 'grande' : ''].filter(Boolean).join(','),
          servicos: (editingCombo?.combo_servico ?? []).map((item) => item.id_servico).join(','),
        }}
        onClose={() => setEditingCombo(null)} onSave={saveEdit}
      />
      <ProfileEditModal
        visible={addVisible} title="Adicionar combo base" accentColor="#FF6B2C"
        fields={[
          { name: 'nome', label: 'Nome do combo' },
          { name: 'descricao', label: 'Descrição', multiline: true },
          { name: 'valor', label: 'Valor total', placeholder: 'R$ 0,00', keyboardType: 'decimal-pad', currency: true },
          { name: 'comodos', label: 'Limite de cômodos', keyboardType: 'number-pad' },
          { name: 'tamanhos', label: 'Tamanhos de residência', options: sizeOptions, multiple: true },
          { name: 'servicos', label: 'Serviços incluídos', options: serviceOptions, multiple: true, multiplePicker: true, selectionPlaceholder: 'Selecionar serviços' },
        ]}
        initialValues={{ nome: '', descricao: '', valor: '', comodos: '', tamanhos: '', servicos: '' }}
        onClose={() => setAddVisible(false)} onSave={saveAdd}
      />
    </SafeAreaView>
  );
}
