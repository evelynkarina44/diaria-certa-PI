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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin() {
    navigation.navigate('EncontrarDiarista');
  }

  function handleForgotPassword() {
    // Quando a tela de recuperação for criada:
    // navigation.navigate('RecuperarSenha');
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
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color="#111111"
              />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>
                Bem-vindo de volta!
              </Text>

              <Text style={styles.subtitle}>
                Faça o login para continuar
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  E-mail
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#9B9B9B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Senha
                </Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="************"
                    placeholderTextColor="#9B9B9B"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowPassword((current) => !current)
                    }
                    activeOpacity={0.7}
                    accessibilityLabel={
                      showPassword
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={25}
                      color="#A0A0A0"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>
                Entrar
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.noAccount}>
                Não tem uma conta?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Cadastro')}
                activeOpacity={0.7}
              >
                <Text style={styles.createAccount}>
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}