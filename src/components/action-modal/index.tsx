import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ActionModalProps = {
  visible: boolean;
  title: string;
  message: string;
  variant?: 'confirm' | 'error' | 'success' | 'info';
  accentColor?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
};

export function ActionModal({
  visible, title, message, variant = 'info', accentColor = '#18C7C8',
  confirmLabel = 'Entendi', cancelLabel, busy = false, onConfirm, onClose,
}: ActionModalProps) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const disabled = busy || pending;
  const color = variant === 'error' ? '#D92D20' : variant === 'success' ? '#008060' : accentColor;
  const icon = variant === 'error' ? 'alert-circle-outline' : variant === 'success' ? 'checkmark-circle-outline' : variant === 'confirm' ? 'help-circle-outline' : 'information-circle-outline';
  function close() { if (!busy && !lock.current) onClose(); }
  async function confirm() {
    if (busy || lock.current) return;
    lock.current = true; setPending(true);
    try { await (onConfirm ?? onClose)(); }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar aviso" disabled={disabled} />
        <View style={styles.dialog} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={[styles.icon, { backgroundColor: color + '12' }]}><Ionicons name={icon} size={34} color={color} /></View>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>
          <View style={styles.actions}>
            {cancelLabel && <Pressable accessibilityRole="button" disabled={disabled} onPress={close} style={[styles.button, styles.cancel, disabled && styles.disabled]}><Text style={styles.cancelText}>{cancelLabel}</Text></Pressable>}
            <Pressable accessibilityRole="button" disabled={disabled} onPress={() => void confirm()} style={[styles.button, { backgroundColor: color }, disabled && styles.disabled]}>
              {disabled ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{confirmLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  dialog: { width: '100%', maxWidth: 430, maxHeight: '85%', borderRadius: 20, backgroundColor: '#FFFFFF', padding: 24 },
  content: { alignItems: 'center' },
  icon: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#222222', textAlign: 'center' },
  message: { fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 22, color: '#667085', textAlign: 'center', marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  button: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  buttonText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF', fontSize: 14, textAlign: 'center' },
  cancel: { borderWidth: 1, borderColor: '#D0D5DD', backgroundColor: '#FFFFFF' },
  cancelText: { fontFamily: 'Poppins_600SemiBold', color: '#344054', fontSize: 14, textAlign: 'center' },
  disabled: { opacity: 0.6 },
});
