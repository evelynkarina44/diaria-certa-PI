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

export default function CadastroClienteScreen({ navigation }: any) {
  const [etapa, setEtapa] = useState(1);

  const [primeiroNome, setPrimeiroNome] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');
  const [cpf, setCpf] = useState('');

  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const progresso = `${(etapa / 3) * 100}%`;

  function handleProximo() {
    if (etapa < 3) {
      setEtapa((etapaAtual) => etapaAtual + 1);
    }
  }

  function handleVoltar() {
    if (etapa > 1) {
      setEtapa((etapaAtual) => etapaAtual - 1);
      return;
    }

    navigation.goBack();
  }

  function handleEnviar() {
    navigation.navigate('Login');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleVoltar}
              activeOpacity={0.7}
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color="#111111"
              />
            </TouchableOpacity>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: progresso },
                ]}
              />
            </View>

            <Text style={styles.stepText}>
              Etapa {etapa} de 3
            </Text>

            <View style={styles.header}>
              <Text style={styles.title}>
                {etapa === 1 && 'Bem-vindo!'}
                {etapa === 2 && 'Informe seu e-mail'}
                {etapa === 3 && 'Crie sua senha'}
              </Text>

              <Text style={styles.subtitle}>
                {etapa === 1 &&
                  'Informe seus dados para criar sua conta'}

                {etapa === 2 &&
                  'Digite o e-mail que será usado no aplicativo'}

                {etapa === 3 &&
                  'Escolha uma senha para finalizar o cadastro'}
              </Text>
            </View>

            {etapa === 1 && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Primeiro nome"
                  placeholderTextColor="#9B9B9B"
                  value={primeiroNome}
                  onChangeText={setPrimeiroNome}
                  autoCapitalize="words"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Último nome"
                  placeholderTextColor="#9B9B9B"
                  value={ultimoNome}
                  onChangeText={setUltimoNome}
                  autoCapitalize="words"
                />

                <TextInput
                  style={styles.input}
                  placeholder="CPF"
                  placeholderTextColor="#9B9B9B"
                  value={cpf}
                  onChangeText={setCpf}
                  keyboardType="number-pad"
                  maxLength={14}
                />
              </View>
            )}

            {etapa === 2 && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#9B9B9B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirme seu e-mail"
                  placeholderTextColor="#9B9B9B"
                  value={confirmarEmail}
                  onChangeText={setConfirmarEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {etapa === 3 && (
              <View style={styles.form}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Senha"
                    placeholderTextColor="#9B9B9B"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setMostrarSenha((valorAtual) => !valorAtual)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={mostrarSenha ? 'eye-off' : 'eye'}
                      size={24}
                      color="#A0A0A0"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirme sua senha"
                    placeholderTextColor="#9B9B9B"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!mostrarConfirmarSenha}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setMostrarConfirmarSenha(
                        (valorAtual) => !valorAtual
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        mostrarConfirmarSenha
                          ? 'eye-off'
                          : 'eye'
                      }
                      size={24}
                      color="#A0A0A0"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.mainButton}
              onPress={etapa < 3 ? handleProximo : handleEnviar}
              activeOpacity={0.85}
            >
              <Text style={styles.mainButtonText}>
                {etapa < 3 ? 'Próximo' : 'Enviar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Já tem uma conta?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginText}>
                  Entre agora
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}