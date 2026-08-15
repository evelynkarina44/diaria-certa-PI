import React, { useState } from 'react';

import {
  ActivityIndicator,
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
import { useAuth } from '../../contexts/GlobalContext';
import { ApiError, getErrorMessage } from '../../services/api';

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();

  async function handleLogin() {
    if (loading) return;

    const errors: FieldErrors = {};
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      errors.email = 'Informe seu e-mail.';
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      errors.email = 'Digite um e-mail válido.';
    }
    if (!password) errors.password = 'Informe sua senha.';

    setFieldErrors(errors);
    setLoginError('');
    if (Object.keys(errors).length) return;

    try {
      setLoading(true);
      const user = await login(normalizedEmail, password);
      const destination = user.requiresProfileSelection
        ? 'SelecionarPerfil'
        : user.activeProfile === 'DIARISTA'
          ? 'HomeDiarista'
          : 'EncontrarDiarista';
      navigation.reset({
        index: 0,
        routes: [
          { name: destination },
        ],
      });
    } catch (error) {
      setLoginError(
        error instanceof ApiError && error.status === 401
          ? 'E-mail ou senha inválidos. Confira seus dados e tente novamente.'
          : getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
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
                  style={[styles.input, fieldErrors.email && styles.inputError]}
                  placeholder="seu@email.com"
                  placeholderTextColor="#9B9B9B"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setFieldErrors((current) => ({ ...current, email: undefined }));
                    setLoginError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                />
                {fieldErrors.email && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Senha
                </Text>

                <View
                  style={[
                    styles.passwordContainer,
                    fieldErrors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="************"
                    placeholderTextColor="#9B9B9B"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setFieldErrors((current) => ({ ...current, password: undefined }));
                      setLoginError('');
                    }}
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
                {fieldErrors.password && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                )}
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

            {loginError ? (
              <View
                style={styles.loginErrorContainer}
                accessibilityRole='alert'
                accessibilityLiveRegion='assertive'
              >
                <Ionicons name='alert-circle-outline' size={20} color='#B42318' />
                <Text style={styles.loginErrorText}>{loginError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={'#FFFFFF'} />
              ) : (
                <Text style={styles.loginButtonText}>
                  Entrar
                </Text>
              )}
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
