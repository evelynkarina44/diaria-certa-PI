import React, { useState } from 'react';

import {
  ActivityIndicator,
  Image,
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

import { styles, desktopStyles } from './styles';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { useAuth } from '../../contexts/GlobalContext';
import { ApiError, getErrorMessage } from '../../services/api';

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: any) {
  const { desktop } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
        : user.activeProfile === 'ADMIN'
          ? 'AdminDenuncias'
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
        <View style={[styles.keyboardView, desktop && desktopStyles.layout]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, desktop && desktopStyles.scrollContent]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={[styles.container, desktop && desktopStyles.container]}>
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

            {desktop && <View style={desktopStyles.brand}>
              <Image source={require('../../assets/logo (2).png')} style={desktopStyles.logo} resizeMode="contain" />
              <Text style={desktopStyles.brandName}>Diária Certa</Text>
            </View>}
            <View style={[styles.header, desktop && desktopStyles.header]}>
              <Text accessibilityRole="header" style={[styles.title, desktop && desktopStyles.title]}>
                Bem-vindo de volta!
              </Text>

              <Text style={[styles.subtitle, desktop && desktopStyles.subtitle]}>
                Faça o login para continuar
              </Text>
            </View>

            <View style={[styles.form, desktop && desktopStyles.form]}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  E-mail
                </Text>

                <TextInput
                  style={[styles.input, desktop && desktopStyles.input, fieldErrors.email && styles.inputError]}
                  accessibilityLabel="E-mail"
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
                    desktop && desktopStyles.passwordContainer,
                    passwordFocused && (desktop ? desktopStyles.passwordContainerFocused : styles.passwordContainerFocused),
                    fieldErrors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    accessibilityLabel="Senha"
                    style={styles.passwordInput}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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
                <Text style={[styles.forgotText, desktop && desktopStyles.link]}>
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
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              style={[styles.loginButton, desktop && desktopStyles.loginButton, loading && styles.loginButtonDisabled]}
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

            <View style={[styles.footer, desktop && desktopStyles.footer]}>
              <Text style={styles.noAccount}>
                Não tem uma conta?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Cadastro')}
                activeOpacity={0.7}
              >
                <Text style={[styles.createAccount, desktop && desktopStyles.link]}>
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {desktop && <View style={desktopStyles.visual} accessibilityLabel="Ambiente acolhedor, com luz natural e plantas">
          <Image source={require('../../assets/welcome-home.webp')} style={desktopStyles.photo} resizeMode="cover" />
        </View>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
