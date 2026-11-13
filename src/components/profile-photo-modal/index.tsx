import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ActionModal } from '../action-modal';
import { getErrorMessage } from '../../services/api';
import { profilePhotoBytes, uploadProfilePhoto } from '../../services/profilePhotoService';

type Props = {
  visible: boolean; imageUrl?: string | null; accentColor: string;
  onClose(): void; onSaved(): Promise<void>;
};

export function ProfilePhotoModal({ visible, imageUrl, accentColor, onClose, onSaved }: Props) {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  useEffect(() => { if (visible) { setPhoto(null); setError(''); } }, [visible]);
  async function choose() {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    try {
      // No navegador, abrir o seletor diretamente preserva o gesto do usuário.
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) throw new Error('Permita o acesso às fotos nas configurações do aparelho para escolher sua imagem.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1],
        quality: 0.8, base64: true, exif: false, allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      const selected = result.assets[0];
      if (!selected?.base64) throw new Error('Não foi possível ler a imagem. Escolha outra foto.');
      profilePhotoBytes(selected.base64);
      setPhoto(selected);
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { locked.current = false; setBusy(false); }
  }
  async function save() {
    if (!photo?.base64 || locked.current) return;
    locked.current = true; setBusy(true);
    try {
      await uploadProfilePhoto(photo.base64);
      await onSaved();
      onClose();
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { locked.current = false; setBusy(false); }
  }
  function close() { if (!locked.current) onClose(); }
  const preview = photo?.uri || imageUrl;
  return (
    <>
      <Modal visible={visible && !error} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.dialog} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>Foto de perfil</Text>
              <View style={[styles.preview, { borderColor: accentColor }]}>
                {preview ? <Image source={{ uri: preview }} style={styles.image} /> : <Ionicons name="person-outline" size={72} color={accentColor} />}
              </View>
              <TouchableOpacity accessibilityRole="button" disabled={busy} style={[styles.choose, busy && styles.disabled]} onPress={choose}>
                <Ionicons name="images-outline" size={21} color={accentColor} />
                <Text style={[styles.chooseText, { color: accentColor }]}>{photo ? 'Escolher outra imagem' : 'Escolher imagem'}</Text>
              </TouchableOpacity>
              <Text style={styles.hint}>JPG, PNG ou WebP · até 5 MB</Text>
            </ScrollView>
            <View style={styles.actions}>
              <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={close} style={[styles.button, styles.cancel]}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" disabled={busy || !photo} onPress={save} style={[styles.button, { backgroundColor: accentColor }, (busy || !photo) && styles.disabled]}>
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Salvar foto</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ActionModal visible={visible && Boolean(error)} variant="error" title="Não foi possível alterar a foto" message={error} accentColor={accentColor} onClose={() => setError('')} />
    </>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  dialog: { width: '100%', maxWidth: 430, maxHeight: '85%', padding: 24, borderRadius: 20, backgroundColor: '#FFFFFF' },
  content: { alignItems: 'center', gap: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 21, color: '#182230' },
  preview: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  choose: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  chooseText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  hint: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#667085' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  button: { flex: 1, minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  cancel: { borderWidth: 1, borderColor: '#D0D5DD' },
  cancelText: { fontFamily: 'Poppins_600SemiBold', color: '#344054', fontSize: 14 },
  saveText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF', fontSize: 14 },
  disabled: { opacity: 0.5 },
});

