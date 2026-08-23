import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

const sizeOptions = [
  { label: 'Pequena', value: 'pequena' },
  { label: 'Média', value: 'media' },
  { label: 'Grande', value: 'grande' },
];

export default function CombosDiaristaScreen({ navigation }: any) {
  const { user } = useAuth();
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
      <View style={styles.header}>
        <HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Meus combos</Text>
          <Text style={styles.subtitle}>Crie pacotes usando os serviços que você oferece.</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Combos base</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.addButton, !servicos.length && styles.disabled]} onPress={() => setAddVisible(true)} disabled={!servicos.length} accessibilityLabel="Adicionar combo">
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        {!servicos.length && !loading ? <Text style={styles.warning}>Cadastre ao menos um serviço antes de criar um combo.</Text> : null}
        {loading ? <ActivityIndicator color="#FF6B2C" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !combos.length ? <View style={styles.emptyCard}><Text style={styles.emptyText}>Nenhum combo cadastrado.</Text></View> : null}
        {combos.map((combo) => (
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
