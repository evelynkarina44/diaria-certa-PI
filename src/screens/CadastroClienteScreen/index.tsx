import React, { useEffect, useState } from 'react';

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
import { ActionModal } from '../../components/action-modal';
import { useRegistrationCheck } from '../../hooks/useRegistrationCheck';
import { cadastroService } from '../../services/cadastroService';
import { getErrorMessage } from '../../services/api';
import type { HouseSize } from '../../services/types';
import { enderecoService } from '../../services/enderecoService';
import { useAuth } from '../../contexts/GlobalContext';
import {
  CadastroConcluidoModal,
  removerFocoAtivoNaWeb,
} from '../../components/cadastro-concluido-modal';
import {
  EnderecoCadastroForm,
  enderecoFormInicial,
  enderecoFormParaApi,
  validarEnderecoForm,
} from '../../components/endereco-cadastro-form';
import { formatDate, formatCpf, formatPhone, isValidCpf, onlyDigits } from '../../utils/inputMasks';
import { getBirthDateError } from '../../utils/birthDate';

function normalizarData(value: string): string | null {
  const texto = value.trim();
  const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const partes = brasileira
    ? [brasileira[3], brasileira[2], brasileira[1]]
    : iso
      ? [iso[1], iso[2], iso[3]]
      : null;

  if (!partes) return null;
  const [ano, mes, dia] = partes.map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) return null;
  return `${partes[0]}-${partes[1]}-${partes[2]}`;
}

export default function CadastroClienteScreen({ navigation }: any) {
  const { user, logout, refreshSession } = useAuth();
  const adicionandoPerfil = Boolean(user && !user.cliente?.length);
  const [etapa, setEtapa] = useState(1);

  const [primeiroNome, setPrimeiroNome] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [qtdComodos, setQtdComodos] = useState('');
  const [tamanhoCasa, setTamanhoCasa] =
    useState<HouseSize>('pequena');

  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [endereco, setEndereco] = useState(enderecoFormInicial);
  const [erroEndereco, setErroEndereco] = useState('');

  const [aviso, setAviso] = useState<{ title: string; message: string } | null>(null);
  function mostrarAviso(title: string, message: string) { setAviso({ title, message }); }
  const { checking: verificando, checkRegistration, cancelCheck } = useRegistrationCheck(
    JSON.stringify([etapa, adicionandoPerfil, primeiroNome, ultimoNome, cpf, telefone, email, confirmarEmail, dataNascimento, qtdComodos]),
    (error) => mostrarAviso('Não foi possível verificar os dados', getErrorMessage(error)),
  );

  const etapaVisual = adicionandoPerfil ? (etapa === 1 ? 1 : 2) : etapa;
  const totalEtapas = adicionandoPerfil ? 2 : 4;
  const progresso = `${(etapaVisual / totalEtapas) * 100}%` as `${number}%`;

  useEffect(() => {
    if (!adicionandoPerfil || !user) return;
    const nomes = user.nome.trim().split(/\s+/);
    setPrimeiroNome(nomes.shift() ?? '');
    setUltimoNome(nomes.join(' '));
    setCpf(formatCpf(user.cpf ?? ''));
    setTelefone(formatPhone(user.telefone));
    setEmail(user.email);
    setConfirmarEmail(user.email);
    enderecoService.listar({ limit: 1 }).then((response) => {
      const atual = response.data[0];
      if (!atual) return;
      setEndereco({
        cep: atual.cep,
        logradouro: atual.logradouro,
        numero: String(atual.numero),
        complemento: atual.complemento ?? '',
        bairro: atual.bairro,
        cidade: atual.cidade,
        estado: atual.estado,
        referencia: atual.referencia ?? '',
      });
    }).catch(() => undefined);
  }, [adicionandoPerfil, user]);

  function validarEtapaAtual() {
    if (etapa === 1) {
      if (!adicionandoPerfil && `${primeiroNome} ${ultimoNome}`.trim().length < 3) {
        mostrarAviso('Dados incompletos', 'Informe seu nome completo.');
        return false;
      }
      if (!adicionandoPerfil && telefone.replace(/\D/g, '').length < 10) {
        mostrarAviso('Telefone inválido', 'Informe o telefone com DDD.');
        return false;
      }
      if (!adicionandoPerfil && !isValidCpf(cpf)) {
        mostrarAviso('CPF inválido', 'Informe um CPF válido. Verifique os números digitados.');
        return false;
      }
      const nascimento = normalizarData(dataNascimento);
      const erroNascimento = nascimento
        ? getBirthDateError(nascimento)
        : 'Informe uma data de nascimento válida no formato DD/MM/AAAA.';
      if (erroNascimento) {
        mostrarAviso('Data de nascimento inválida', erroNascimento);
        return false;
      }
      const comodos = Number(qtdComodos);
      if (!Number.isInteger(comodos) || comodos < 1 || comodos > 100) {
        mostrarAviso('Quantidade inválida', 'Informe de 1 a 100 cômodos.');
        return false;
      }
    }
    if (etapa === 2) {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        mostrarAviso('E-mail inválido', 'Informe um endereço de e-mail válido.');
        return false;
      }
      if (email.trim().toLowerCase() !== confirmarEmail.trim().toLowerCase()) {
        mostrarAviso('E-mails diferentes', 'Os dois e-mails devem ser iguais.');
        return false;
      }
    }
    if (etapa === 3) {
      if (senha.length < 8) {
        mostrarAviso('Senha inválida', 'A senha deve ter pelo menos 8 caracteres.');
        return false;
      }
      if (senha !== confirmarSenha) {
        mostrarAviso('Senhas diferentes', 'As duas senhas devem ser iguais.');
        return false;
      }
    }
    if (etapa === 4) {
      const erro = validarEnderecoForm(endereco);
      setErroEndereco(erro ?? '');
      if (erro) return false;
    }
    return true;
  }

  function handleProximo() {
    if (verificando || enviando || !validarEtapaAtual()) return;
    const avancar = () => {
      if (adicionandoPerfil && etapa === 1) { setEtapa(4); return; }
      if (etapa < 4) setEtapa((atual) => atual + 1);
    };
    if (!adicionandoPerfil && (etapa === 1 || etapa === 2)) {
      void checkRegistration(
        etapa === 1 ? { cpf: onlyDigits(cpf) } : { email: email.trim().toLowerCase() },
        avancar,
      );
      return;
    }
    avancar();
  }

  function handleVoltar() {
    cancelCheck();
    if (adicionandoPerfil && etapa === 4) {
      setEtapa(1);
      return;
    }
    if (etapa > 1) {
      setEtapa((etapaAtual) => etapaAtual - 1);
      return;
    }

    navigation.goBack();
  }

  async function handleEnviar() {
    if (!validarEtapaAtual() || enviando) return;
    const nascimento = normalizarData(dataNascimento);
    const erroNascimento = nascimento
      ? getBirthDateError(nascimento)
      : 'Informe uma data de nascimento válida no formato DD/MM/AAAA.';
    if (!nascimento || erroNascimento) {
      setEtapa(1);
      mostrarAviso('Data de nascimento inválida', erroNascimento ?? 'Informe uma data de nascimento válida.');
      return;
    }

    setEnviando(true);
    try {
      const perfil = {
        data_nascimento: nascimento,
        qtd_comodos: Number(qtdComodos),
        tamanho_casa: tamanhoCasa,
        endereco: enderecoFormParaApi(endereco),
      };
      if (adicionandoPerfil) {
        await cadastroService.adicionarPerfilCliente(perfil);
        await refreshSession();
        navigation.reset({ index: 0, routes: [{ name: 'SelecionarPerfil' }] });
        return;
      }
      await cadastroService.criarCliente(
        {
          nome: `${primeiroNome} ${ultimoNome}`.trim(),
          email: email.trim().toLowerCase(),
          senha,
          telefone: onlyDigits(telefone),
          foto_perfil: '',
          cpf: onlyDigits(cpf),
          tipo: 'CLIENTE',
        },
        perfil,
      );
      await logout();
      removerFocoAtivoNaWeb();
      setCadastroConcluido(true);
    } catch (error) {
      mostrarAviso('Não foi possível cadastrar', getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
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
              Etapa {etapaVisual} de {totalEtapas}
            </Text>

            <View style={styles.header}>
              <Text style={styles.title}>
                {etapa === 1 && (adicionandoPerfil ? 'Complete seu perfil de cliente' : 'Bem-vindo!')}
                {etapa === 2 && 'Informe seu e-mail'}
                {etapa === 3 && 'Crie sua senha'}
                {etapa === 4 && 'Onde você mora?'}
              </Text>

              <Text style={styles.subtitle}>
                {etapa === 1 &&
                  'Informe seus dados para criar sua conta'}

                {etapa === 2 &&
                  'Digite o e-mail que será usado no aplicativo'}

                {etapa === 3 &&
                  'Escolha uma senha segura para sua conta'}

                {etapa === 4 &&
                  'Finalize o cadastro informando seu endereço'}
              </Text>
            </View>

            {etapa === 1 && (
              <View style={styles.form}>
                {!adicionandoPerfil && (<>
                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder="Primeiro nome"
                  placeholderTextColor="#9B9B9B"
                  value={primeiroNome}
                  onChangeText={setPrimeiroNome}
                  autoCapitalize="words"
                />

                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder="Último nome"
                  placeholderTextColor="#9B9B9B"
                  value={ultimoNome}
                  onChangeText={setUltimoNome}
                  autoCapitalize="words"
                />

                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder="CPF"
                  placeholderTextColor="#9B9B9B"
                  value={cpf}
                  onChangeText={(value) => setCpf(formatCpf(value))}
                  keyboardType="number-pad"
                  maxLength={14}
                />

                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder='Telefone com DDD'
                  placeholderTextColor='#9B9B9B'
                  value={telefone}
                  onChangeText={(value) => setTelefone(formatPhone(value))}
                  keyboardType='phone-pad'
                  maxLength={15}
                />
                </>)}

                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder='Data de nascimento (DD/MM/AAAA)'
                  placeholderTextColor='#9B9B9B'
                  value={dataNascimento}
                  onChangeText={(value) => setDataNascimento(formatDate(value))}
                  keyboardType='number-pad'
                  maxLength={10}
                />

                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder='Quantidade de cômodos'
                  placeholderTextColor='#9B9B9B'
                  value={qtdComodos}
                  onChangeText={setQtdComodos}
                  keyboardType='number-pad'
                  maxLength={3}
                />

                <Text style={styles.fieldLabel}>Tamanho da residência</Text>
                <View style={styles.sizeOptions}>
                  {(['pequena', 'media', 'grande'] as HouseSize[]).map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        tamanhoCasa === size && styles.sizeButtonSelected,
                      ]}
                      onPress={() => setTamanhoCasa(size)}
                    >
                      <Text style={[
                        styles.sizeButtonText,
                        tamanhoCasa === size && styles.sizeButtonTextSelected,
                      ]}>
                        {size === 'media' ? 'Média' : `${size[0].toUpperCase()}${size.slice(1)}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {etapa === 2 && (
              <View style={styles.form}>
                <TextInput
                  editable={!verificando && !enviando}
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#9B9B9B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  editable={!verificando && !enviando}
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
                  editable={!verificando && !enviando}
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
                  editable={!verificando && !enviando}
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

            {etapa === 4 && (
              <EnderecoCadastroForm
                value={endereco}
                error={erroEndereco}
                onChange={(value) => {
                  setEndereco(value);
                  setErroEndereco('');
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.mainButton, (enviando || verificando) && styles.mainButtonDisabled]}
              onPress={etapa < 4 ? handleProximo : handleEnviar}
              disabled={enviando || verificando}
              activeOpacity={0.85}
            >
              {enviando || verificando ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <Text style={styles.mainButtonText}>
                  {etapa < 4 ? 'Próximo' : 'Finalizar cadastro'}
                </Text>
              )}
            </TouchableOpacity>

            {!adicionandoPerfil && <View style={styles.footer}>
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
            </View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ActionModal
        visible={Boolean(aviso)}
        title={aviso?.title ?? ''}
        message={aviso?.message ?? ''}
        variant="error"
        accentColor="#18C7C8"
        onClose={() => setAviso(null)}
      />
      <CadastroConcluidoModal
        visible={cadastroConcluido}
        perfil='cliente'
        onContinue={() => {
          setCadastroConcluido(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }}
      />
    </SafeAreaView>
  );
}
