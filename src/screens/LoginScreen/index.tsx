import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

import ActionButton from '../../components/action-button';
import { styles } from './styles';
import { request } from '../../services/api';
import { colors } from '../../global';

export default function LoginMobile({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    try {
      // const resp = await request({ method: 'POST', url: '/api/login', data: { email, password } });
      // apenas navegar para Home como placeholder
      navigation.navigate('Home');
    } catch (error) {
      console.log('Erro no login', error);
      Alert.alert('Erro', 'Falha ao tentar entrar');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'\u2039'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Faça o login para continuar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={colors.cinza}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder="************"
              placeholderTextColor={colors.cinza}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowPassword((s) => !s)}
            >
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => Alert.alert('Recuperar senha', 'Fluxo de recuperação') }>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        <ActionButton title="Entrar" onPress={handleLogin} />

        <View style={styles.footer}>
          <Text style={styles.noAccount}>
            Não tem uma conta?{' '}
            <Text style={styles.create} onPress={() => navigation.navigate('Cadastro')}>
              Criar conta
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}