import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getErrorMessage } from '../../services/api';
import { styles } from './styles';
import { buscarEnderecoPorCep } from '../../services/cepService';

export type ProfileEditField = {
  name: string;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  options?: Array<{ label: string; value: string }>;
  multiple?: boolean;
};

type ProfileEditModalProps = {
  visible: boolean;
  title: string;
  accentColor: string;
  fields: ProfileEditField[];
  initialValues: Record<string, string>;
  onClose(): void;
  onSave(values: Record<string, string>): Promise<void>;
  addressAutoFill?: boolean;
};

export function ProfileEditModal({ visible, title, accentColor, fields, initialValues, onClose, onSave, addressAutoFill = false }: ProfileEditModalProps) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const consultaAtual = useRef(0);

  useEffect(() => {
    if (visible) {
      setValues(initialValues);
      setError('');
      setCepError('');
    }
  }, [visible, initialValues]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      await onSave(values);
      onClose();
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function updateField(name: string, input: string) {
    const value = name === 'cep'
      ? input.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d+)/, '$1-$2')
      : input;
    setValues((current) => ({ ...current, [name]: value }));
    if (!addressAutoFill || name !== 'cep') return;

    setCepError('');
    const digits = value.replace(/\D/g, '');
    const requestId = ++consultaAtual.current;
    if (digits.length !== 8) {
      setConsultandoCep(false);
      return;
    }
    setConsultandoCep(true);
    try {
      const address = await buscarEnderecoPorCep(digits);
      if (requestId !== consultaAtual.current) return;
      setValues((current) => ({
        ...current,
        cep: address.cep,
        logradouro: address.logradouro,
        complemento: address.complemento || current.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
      }));
    } catch (cause) {
      if (requestId === consultaAtual.current) setCepError(cause instanceof Error ? cause.message : 'Não foi possível consultar o CEP.');
    } finally {
      if (requestId === consultaAtual.current) setConsultandoCep(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: `${accentColor}1A` }]}>
              <Ionicons name="pencil" size={19} color={accentColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={saving} accessibilityLabel="Fechar edição">
              <Ionicons name="close" size={22} color="#555555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fieldsScroll} contentContainerStyle={styles.fields} keyboardShouldPersistTaps="handled">
            {fields.map((field) => (
              <View key={field.name} style={styles.fieldGroup}>
                <Text style={styles.label}>{field.label}</Text>
                {field.options ? (
                  <View style={styles.optionsRow}>
                    {field.options.map((option) => {
                      const selectedValues = (values[field.name] ?? '').split(',').filter(Boolean);
                      const selected = field.multiple
                        ? selectedValues.includes(option.value)
                        : values[field.name] === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[styles.option, selected && { borderColor: accentColor, backgroundColor: `${accentColor}12` }]}
                          onPress={() => setValues((current) => {
                            if (!field.multiple) return { ...current, [field.name]: option.value };
                            const currentValues = (current[field.name] ?? '').split(',').filter(Boolean);
                            const nextValues = currentValues.includes(option.value)
                              ? currentValues.filter((item) => item !== option.value)
                              : [...currentValues, option.value];
                            return { ...current, [field.name]: nextValues.join(',') };
                          })}
                        >
                          <Text style={[styles.optionText, selected && { color: accentColor }]}>{option.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={[styles.input, field.multiline && styles.multilineInput]}
                    value={values[field.name] ?? ''}
                    onChangeText={(value) => updateField(field.name, value)}
                    placeholder={field.placeholder}
                    placeholderTextColor="#A0A0A0"
                    keyboardType={field.keyboardType}
                    multiline={field.multiline}
                    maxLength={field.maxLength}
                    autoCapitalize={field.keyboardType === 'email-address' || field.keyboardType === 'url' ? 'none' : 'sentences'}
                  />
                )}
                {field.name === 'cep' && consultandoCep ? <Text style={[styles.cepStatus, { color: accentColor }]}>Buscando endereço...</Text> : null}
                {field.name === 'cep' && cepError ? <Text style={styles.cepError}>{cepError}</Text> : null}
              </View>
            ))}
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentColor }]} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
