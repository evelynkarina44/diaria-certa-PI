import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileEditModal } from '../profile-edit-modal';
import { enderecoService } from '../../services/enderecoService';
import type { Cliente, Endereco, HouseSize } from '../../services/types';

const sizes = { pequena: 'Pequena', media: 'Média', grande: 'Grande' };
export function ClientHouses({ cliente, onUpdated }: { cliente: Cliente | null; onUpdated(): Promise<void> }) {
  const [editing, setEditing] = useState<Endereco | null>(null);
  const [creating, setCreating] = useState(false);
  const addresses = cliente?.endereco ?? [];
  function close() { setCreating(false); setEditing(null); }
  async function save(values: Record<string, string>) {
    if (!cliente) throw new Error('Não foi possível identificar o cliente.');
    const data = {
      apelido: values.apelido.trim(), qtd_comodos: Number(values.qtd_comodos), tamanho_casa: values.tamanho_casa as HouseSize,
      cep: values.cep.trim(), logradouro: values.logradouro.trim(), numero: Number(values.numero),
      complemento: values.complemento.trim() || null, bairro: values.bairro.trim(),
      cidade: values.cidade.trim(), estado: values.estado.trim().toUpperCase(), referencia: values.referencia.trim() || null,
    };
    if (editing) await enderecoService.atualizar(editing.id_endereco, data);
    else await enderecoService.criar({ ...data, id_cliente: cliente.id_cliente });
    await onUpdated();
  }
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.title}>Minhas casas</Text>
        <TouchableOpacity accessibilityRole="button" disabled={!cliente} style={styles.add} onPress={() => { setEditing(null); setCreating(true); }}>
          <Ionicons name="add-circle-outline" size={20} color="#008A99" /><Text style={styles.addText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Cadastre cada residência e escolha onde será a diária.</Text>
      {addresses.map((address, index) => (
        <View key={address.id_endereco} style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.nameRow}><Ionicons name="home-outline" size={21} color="#008A99" /><Text style={styles.name}>{address.apelido || `Casa ${index + 1}`}</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Editar ${address.apelido || `Casa ${index + 1}`}`} style={styles.edit} onPress={() => { setCreating(false); setEditing(address); }}>
              <Ionicons name="create-outline" size={21} color="#008A99" />
            </TouchableOpacity>
          </View>
          <Text style={styles.text}>{address.logradouro}, {address.numero}{address.complemento ? ` — ${address.complemento}` : ''}</Text>
          <Text style={styles.text}>{address.bairro} · {address.cidade}/{address.estado}</Text>
          <Text style={styles.text}>CEP {address.cep}</Text>
          <Text style={styles.meta}>{address.qtd_comodos ?? cliente?.qtd_comodos} cômodos · Casa {sizes[address.tamanho_casa ?? cliente?.tamanho_casa ?? 'pequena'].toLowerCase()}</Text>
          {Boolean(address.referencia) && <Text style={styles.text}>Referência: {address.referencia}</Text>}
        </View>
      ))}
      {!addresses.length && <Text style={styles.text}>Nenhuma casa cadastrada.</Text>}
      <ProfileEditModal visible={creating || Boolean(editing)} title={editing ? 'Editar casa' : 'Adicionar casa'} accentColor="#18C7C8" addressAutoFill
        fields={[
          { name: 'apelido', label: 'Nome da casa', placeholder: 'Ex.: Casa 1, Casa da praia', maxLength: 60, validate: value => value.trim().length >= 2 ? null : 'Informe um nome para esta casa.' },
          { name: 'cep', label: 'CEP', placeholder: '00000-000', keyboardType: 'number-pad', maxLength: 9 },
          { name: 'logradouro', label: 'Rua / avenida' },
          { name: 'numero', label: 'Número', keyboardType: 'number-pad', validate: value => /^\d+$/.test(value.trim()) ? null : 'Informe um número válido.' },
          { name: 'complemento', label: 'Complemento', placeholder: 'Apartamento, bloco...' },
          { name: 'bairro', label: 'Bairro' }, { name: 'cidade', label: 'Cidade' },
          { name: 'estado', label: 'Estado', maxLength: 2 },
          { name: 'qtd_comodos', label: 'Quantidade de cômodos desta casa', keyboardType: 'number-pad', validate: value => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100 ? null : 'Informe de 1 a 100 cômodos.' },
          { name: 'tamanho_casa', label: 'Tamanho desta casa', options: Object.entries(sizes).map(([value, label]) => ({ label, value })) },
          { name: 'referencia', label: 'Referência', placeholder: 'Próximo a...' },
        ]}
        initialValues={{
          apelido: editing?.apelido || `Casa ${addresses.length + 1}`,
          cep: editing?.cep ?? '', logradouro: editing?.logradouro ?? '', numero: String(editing?.numero ?? ''),
          complemento: editing?.complemento ?? '', bairro: editing?.bairro ?? '', cidade: editing?.cidade ?? '',
          estado: editing?.estado ?? '', referencia: editing?.referencia ?? '',
          qtd_comodos: editing ? String(editing.qtd_comodos ?? cliente?.qtd_comodos ?? '') : '',
          tamanho_casa: editing?.tamanho_casa ?? (editing ? cliente?.tamanho_casa : null) ?? 'pequena',
        }} onClose={close} onSave={save} />
    </View>
  );
}
const styles = StyleSheet.create({
  section: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 18, marginBottom: 18, gap: 10 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: '#182230' },
  hint: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, color: '#667085' },
  add: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44 },
  addText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#008A99' },
  card: { borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 14, padding: 12, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  name: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#182230' },
  edit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#475467', lineHeight: 19 },
  meta: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#008A99', marginTop: 5 },
});

