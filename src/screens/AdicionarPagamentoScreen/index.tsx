import React, { useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type TipoCartao = 'debito' | 'credito';

export default function AdicionarPagamentoScreen({
  navigation,
}: any) {
  const [nomeTitular, setNomeTitular] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [apelido, setApelido] = useState('');
  const [tipoCartao, setTipoCartao] =
    useState<TipoCartao>('debito');

  function handleAdicionar() {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Pagamento
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>
              Dados do cartão
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do titular"
              placeholderTextColor="#A0A0A0"
              value={nomeTitular}
              onChangeText={setNomeTitular}
            />

            <TextInput
              style={styles.input}
              placeholder="Número do cartão"
              placeholderTextColor="#A0A0A0"
              value={numeroCartao}
              onChangeText={setNumeroCartao}
              keyboardType="number-pad"
            />

            <View style={styles.row}>
              <TextInput
                style={styles.halfInput}
                placeholder="Validade"
                placeholderTextColor="#A0A0A0"
                value={validade}
                onChangeText={setValidade}
                keyboardType="number-pad"
              />

              <TextInput
                style={styles.halfInput}
                placeholder="CVV"
                placeholderTextColor="#A0A0A0"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setTipoCartao('debito')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    tipoCartao === 'debito'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={23}
                  color={
                    tipoCartao === 'debito'
                      ? '#18C7C8'
                      : '#B5B5B5'
                  }
                />

                <Text style={styles.radioText}>
                  Débito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setTipoCartao('credito')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    tipoCartao === 'credito'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={23}
                  color={
                    tipoCartao === 'credito'
                      ? '#18C7C8'
                      : '#B5B5B5'
                  }
                />

                <Text style={styles.radioText}>
                  Crédito
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="CPF do titular"
              placeholderTextColor="#A0A0A0"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="number-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Apelido do cartão (opcional)"
              placeholderTextColor="#A0A0A0"
              value={apelido}
              onChangeText={setApelido}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdicionar}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>
              Adicionar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}