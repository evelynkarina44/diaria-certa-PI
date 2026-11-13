import React from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Endereco } from '../../services/types';

type Props = {
  visible: boolean; addresses: Endereco[]; selectedId?: number; loading: boolean;
  onSelect(address: Endereco): void; onClose(): void; onManage(): void;
};

export function LocationPickerModal({ visible, addresses, selectedId, loading, onSelect, onClose, onManage }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.headingRow}>
            <Text style={styles.title}>Minha localização</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar seleção de endereço" onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={23} color="#475467" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Escolha a casa para buscar diaristas próximas.</Text>
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {loading && <ActivityIndicator color="#18C7C8" />}
            {!loading && addresses.map((address, index) => {
              const selected = address.id_endereco === selectedId;
              return (
                <TouchableOpacity key={address.id_endereco} accessibilityRole="radio" accessibilityState={{ checked: selected }}
                  accessibilityLabel={`Usar ${address.apelido || `Casa ${index + 1}`} como localização`}
                  style={[styles.address, selected && styles.addressSelected]}
                  onPress={() => { onSelect(address); onClose(); }}>
                  <View style={styles.addressHeading}>
                    <Ionicons name="home-outline" size={22} color="#008A99" />
                    <Text style={styles.name}>{address.apelido || `Casa ${index + 1}`}</Text>
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={23} color="#18C7C8" />
                  </View>
                  <Text style={styles.text}>{address.logradouro}, {address.numero}{address.complemento ? ` — ${address.complemento}` : ''}</Text>
                  <Text style={styles.text}>{address.bairro} · {address.cidade}/{address.estado}</Text>
                  <Text style={styles.meta}>CEP {address.cep}</Text>
                </TouchableOpacity>
              );
            })}
            {!loading && addresses.length === 0 && <Text style={styles.subtitle}>Cadastre uma casa em Meu perfil para encontrar diaristas próximas.</Text>}
          </ScrollView>
          <TouchableOpacity accessibilityRole="button" style={styles.manage} onPress={() => { onClose(); onManage(); }}>
            <Ionicons name="add-circle-outline" size={21} color="#008A99" /><Text style={styles.manageText}>Cadastrar ou editar casas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  dialog: { width: '100%', maxWidth: 460, maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 21, color: '#182230' },
  close: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#667085', lineHeight: 19, marginBottom: 14 },
  list: { gap: 10, paddingBottom: 4 },
  address: { borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 14, padding: 12, gap: 5 },
  addressSelected: { borderColor: '#18C7C8', backgroundColor: '#EAFBFB' },
  addressHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  name: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#182230' },
  text: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#475467', lineHeight: 19 },
  meta: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#008A99' },
  manage: { flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 14, borderRadius: 12, backgroundColor: '#EAFBFB', paddingHorizontal: 10 },
  manageText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#008A99' },
});

