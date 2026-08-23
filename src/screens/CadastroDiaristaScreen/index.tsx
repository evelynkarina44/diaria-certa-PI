import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
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
import { cadastroService } from '../../services/cadastroService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../contexts/GlobalContext';
import { enderecoService } from '../../services/enderecoService';
import { servicoService } from '../../services/servicoService';
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
import { formatCpf, formatPhone, isValidCpf, onlyDigits } from '../../utils/inputMasks';

type ServicoIndividual = {
  key: string;
  id_servico?: number;
  nome_servico: string;
  descricao?: string | null;
  preco: string;
};

const tamanhosResidencia = [
  { id: 'pequena', label: 'Pequena' },
  { id: 'media', label: 'Média' },
  { id: 'grande', label: 'Grande' },
];

export default function CadastroDiaristaScreen({ navigation }: any) {
  const { user, logout, refreshSession } = useAuth();
  const adicionandoPerfil = Boolean(user && !user.diarista?.length);
  const [etapa, setEtapa] = useState(adicionandoPerfil ? 4 : 1);

  const [primeiroNome, setPrimeiroNome] = useState('');
  const [ultimoNome, setUltimoNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [sobreVoce, setSobreVoce] = useState('');
  const [qtdMaxComodos, setQtdMaxComodos] = useState('8');
  const [erroDescricao, setErroDescricao] = useState('');
  const [erroComodos, setErroComodos] = useState('');
  const [enviando, setEnviando] = useState(false);
  const envioEmAndamento = useRef(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [endereco, setEndereco] = useState(enderecoFormInicial);
  const [erroEndereco, setErroEndereco] = useState('');

  const [tamanhosSelecionados, setTamanhosSelecionados] =
    useState<string[]>(['pequena']);

  const [servicos, setServicos] = useState<ServicoIndividual[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [erroServicos, setErroServicos] = useState('');

  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);

  const [novoServico, setNovoServico] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const [nomeCombo, setNomeCombo] = useState('');
  const [descricaoCombo, setDescricaoCombo] = useState('');
  const [servicosComboSelecionados, setServicosComboSelecionados] =
    useState<string[]>([]);

  const [valorCombo, setValorCombo] = useState('');

  const etapaVisual = adicionandoPerfil ? etapa - 3 : etapa;
  const totalEtapas = adicionandoPerfil ? 3 : 6;
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

  useEffect(() => {
    let mounted = true;
    setCarregandoServicos(true);
    servicoService.listar({ limit: 100 }).then((catalogo) => {
      if (!mounted) return;
      setServicos(catalogo.map((servico) => ({
        key: `servico-${servico.id_servico}`,
        id_servico: servico.id_servico,
        nome_servico: servico.nome_servico,
        descricao: servico.descricao,
        preco: '',
      })));
      setErroServicos('');
    }).catch((error) => {
      if (mounted) setErroServicos(getErrorMessage(error));
    }).finally(() => {
      if (mounted) setCarregandoServicos(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function valorMonetario(value: string) {
    return Number(value.replace(/\D/g, '')) / 100;
  }

  function validarEtapaAtual() {
    if (etapa === 1) {
      if (`${primeiroNome} ${ultimoNome}`.trim().length < 3) {
        Alert.alert('Dados incompletos', 'Informe seu nome completo.');
        return false;
      }
      if (telefone.replace(/\D/g, '').length < 10) {
        Alert.alert('Telefone inválido', 'Informe o telefone com DDD.');
        return false;
      }
      if (!isValidCpf(cpf)) {
        Alert.alert('CPF inválido', 'Informe um CPF válido. Verifique os números digitados.');
        return false;
      }
    }
    if (etapa === 2) {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        Alert.alert('E-mail inválido', 'Informe um endereço de e-mail válido.');
        return false;
      }
      if (email.trim().toLowerCase() !== confirmarEmail.trim().toLowerCase()) {
        Alert.alert('E-mails diferentes', 'Os dois e-mails devem ser iguais.');
        return false;
      }
    }
    if (etapa === 3) {
      if (senha.length < 8) {
        Alert.alert('Senha inválida', 'A senha deve ter pelo menos 8 caracteres.');
        return false;
      }
      if (senha !== confirmarSenha) {
        Alert.alert('Senhas diferentes', 'As duas senhas devem ser iguais.');
        return false;
      }
    }
    if (etapa === 4) {
      let etapaValida = true;
      if (sobreVoce.trim().length < 20) {
        setErroDescricao('Escreva pelo menos 20 caracteres sobre sua experiência.');
        etapaValida = false;
      } else {
        setErroDescricao('');
      }
      const comodos = Number(qtdMaxComodos);
      if (!Number.isInteger(comodos) || comodos < 1 || comodos > 100) {
        setErroComodos('Informe uma quantidade entre 1 e 100 cômodos.');
        etapaValida = false;
      } else {
        setErroComodos('');
      }
      const selecionados = servicos.filter((servico) => servicosSelecionados.includes(servico.key));
      if (!selecionados.length) {
        Alert.alert('Serviços obrigatórios', 'Selecione ao menos um serviço que você oferece.');
        etapaValida = false;
      } else if (selecionados.some((servico) => valorMonetario(servico.preco) <= 0)) {
        Alert.alert('Valores obrigatórios', 'Informe um valor maior que zero para cada serviço selecionado.');
        etapaValida = false;
      }
      if (!etapaValida) return false;
    }
    if (etapa === 5) {
      if (nomeCombo.trim().length < 2) {
        Alert.alert('Nome obrigatório', 'Informe o nome do combo.');
        return false;
      }
      if (valorMonetario(valorCombo) <= 0) {
        Alert.alert('Valor inválido', 'Informe um valor maior que zero para o combo.');
        return false;
      }
      if (!servicosComboSelecionados.length) {
        Alert.alert('Serviços obrigatórios', 'Selecione ao menos um serviço para o combo.');
        return false;
      }
      if (!tamanhosSelecionados.length) {
        Alert.alert('Tamanho obrigatório', 'Selecione ao menos um tamanho de residência atendido pelo combo.');
        return false;
      }
    }
    if (etapa === 6) {
      const erro = validarEnderecoForm(endereco);
      setErroEndereco(erro ?? '');
      if (erro) return false;
    }
    return true;
  }

  function handleProximo() {
    if (!validarEtapaAtual()) return;
    if (etapa === 4) {
      setServicosComboSelecionados([...servicosSelecionados]);
    }
    if (etapa < 6) {
      setEtapa((etapaAtual) => etapaAtual + 1);
    }
  }

  function handleVoltar() {
    if (adicionandoPerfil && etapa === 4) {
      navigation.goBack();
      return;
    }
    if (etapa > 1) {
      setEtapa((etapaAtual) => etapaAtual - 1);
      return;
    }

    navigation.goBack();
  }

  async function handleEnviar() {
    if (envioEmAndamento.current || enviando || !validarEtapaAtual()) return;
    envioEmAndamento.current = true;
    setEnviando(true);
    try {
      const perfil = {
        descricao: sobreVoce.trim(),
        frequencia_resposta: null,
        qtd_max_comodos: Number(qtdMaxComodos),
        endereco: enderecoFormParaApi(endereco),
        servicos: servicos
          .filter((servico) => servicosSelecionados.includes(servico.key))
          .map((servico) => ({
            ...(servico.id_servico
              ? { id_servico: servico.id_servico }
              : { nome_servico: servico.nome_servico, descricao: servico.descricao ?? null }),
            preco: valorMonetario(servico.preco),
            faz_parte_combo_base: servicosComboSelecionados.includes(servico.key),
          })),
        combo_base: {
          nome_combo: nomeCombo.trim(),
          valor_base: valorMonetario(valorCombo),
          descricao: descricaoCombo.trim() || null,
          qtd_comodos_casa: Number(qtdMaxComodos),
          atende_casa_pequena: tamanhosSelecionados.includes('pequena'),
          atende_casa_media: tamanhosSelecionados.includes('media'),
          atende_casa_grande: tamanhosSelecionados.includes('grande'),
        },
      };
      if (adicionandoPerfil) {
        await cadastroService.adicionarPerfilDiarista(perfil);
        await refreshSession();
        navigation.reset({ index: 0, routes: [{ name: 'SelecionarPerfil' }] });
        return;
      }
      await cadastroService.criarDiarista(
        {
          nome: `${primeiroNome} ${ultimoNome}`.trim(),
          email: email.trim().toLowerCase(),
          senha,
          telefone: onlyDigits(telefone),
          foto_perfil: '',
          cpf: onlyDigits(cpf),
          tipo: 'DIARISTA',
        },
        perfil,
      );
      await logout();
      removerFocoAtivoNaWeb();
      setCadastroConcluido(true);
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', getErrorMessage(error));
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }
  }

  function alternarServicoIndividual(key: string) {
    setServicosSelecionados((selecionadosAtuais) => {
      const estaSelecionado = selecionadosAtuais.includes(key);

      if (estaSelecionado) {
        setServicosComboSelecionados((atuais) => atuais.filter((item) => item !== key));
        return selecionadosAtuais.filter(
          (servicoKey) => servicoKey !== key
        );
      }

      return [...selecionadosAtuais, key];
    });
  }

  function formatarValorEmReais(valor: string) {
    const somenteNumeros = valor.replace(/\D/g, '');

    if (!somenteNumeros) {
      return '';
    }

    const valorNumerico = Number(somenteNumeros) / 100;

    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function handleNovoValor(valor: string) {
    setNovoValor(formatarValorEmReais(valor));
  }

  function handleValorCombo(valor: string) {
    setValorCombo(formatarValorEmReais(valor));
  }

  function atualizarPrecoServico(key: string, valor: string) {
    const preco = formatarValorEmReais(valor);
    setServicos((atuais) => atuais.map((servico) => (
      servico.key === key ? { ...servico, preco } : servico
    )));
  }

  function handleAdicionarServico() {
    if (novoServico.trim().length < 2 || valorMonetario(novoValor) <= 0) {
      Alert.alert('Serviço incompleto', 'Informe o nome e um valor maior que zero.');
      return;
    }

    const key = `novo-${Date.now()}`;

    const servicoAdicionado: ServicoIndividual = {
      key,
      nome_servico: novoServico.trim(),
      descricao: null,
      preco: novoValor,
    };

    setServicos((servicosAtuais) => [
      ...servicosAtuais,
      servicoAdicionado,
    ]);

    setServicosSelecionados((selecionadosAtuais) => [
      ...selecionadosAtuais,
      key,
    ]);

    setNovoServico('');
    setNovoValor('');
  }

  function alternarServicoCombo(servico: string) {
    setServicosComboSelecionados((selecionadosAtuais) => {
      const estaSelecionado =
        selecionadosAtuais.includes(servico);

      if (estaSelecionado) {
        return selecionadosAtuais.filter(
          (item) => item !== servico
        );
      }

      return [...selecionadosAtuais, servico];
    });
  }

  function alternarTamanho(id: string) {
    setTamanhosSelecionados((atuais) => (
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]
    ));
  }

  function getTituloEtapa() {
    switch (etapa) {
      case 1:
        return 'Bem-vindo!';

      case 2:
        return 'Informe seu e-mail';

      case 3:
        return 'Crie sua senha';

      case 4:
        return 'Sobre você!';

      case 5:
        return 'Monte seu combo inicial';

      case 6:
        return 'Onde você atende?';

      default:
        return '';
    }
  }

  function getSubtituloEtapa() {
    switch (etapa) {
      case 1:
        return 'Informe seus dados para criar sua conta';

      case 2:
        return 'Digite o e-mail que será usado no aplicativo';

      case 3:
        return 'Escolha uma senha para finalizar o acesso';

      case 4:
        return 'Conte um pouco mais sobre você para que as pessoas saibam quem você é!';

      case 6:
        return 'Finalize o cadastro informando seu endereço';

      default:
        return '';
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
                  {
                    width: progresso,
                  },
                ]}
              />
            </View>

            <Text style={styles.stepText}>
              Etapa {etapaVisual} de {totalEtapas}
            </Text>

            <View style={styles.header}>
              <Text style={styles.title}>
                {getTituloEtapa()}
              </Text>

              {getSubtituloEtapa() !== '' && (
                <Text style={styles.subtitle}>
                  {getSubtituloEtapa()}
                </Text>
              )}
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
                  onChangeText={(value) => setCpf(formatCpf(value))}
                  keyboardType="number-pad"
                  maxLength={14}
                />

                <TextInput
                  style={styles.input}
                  placeholder='Telefone com DDD'
                  placeholderTextColor='#9B9B9B'
                  value={telefone}
                  onChangeText={(value) => setTelefone(formatPhone(value))}
                  keyboardType='phone-pad'
                  maxLength={15}
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
                  autoCorrect={false}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirme seu e-mail"
                  placeholderTextColor="#9B9B9B"
                  value={confirmarEmail}
                  onChangeText={setConfirmarEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
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
                      setMostrarSenha(
                        (valorAtual) => !valorAtual
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        mostrarSenha ? 'eye-off' : 'eye'
                      }
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

            {etapa === 4 && (
              <View style={styles.professionalContent}>
                <Text style={styles.professionalFieldLabel}>
                  Conte sobre você <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.aboutInput,
                    erroDescricao && styles.inputError,
                  ]}
                  placeholder="Trabalho como diarista há 4 anos, sou organizada e de confiança."
                  placeholderTextColor="#9B9B9B"
                  value={sobreVoce}
                  onChangeText={(value) => {
                    setSobreVoce(value);
                    if (value.trim().length >= 20) setErroDescricao('');
                  }}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.fieldFeedbackRow}>
                  <Text style={styles.inlineError}>{erroDescricao}</Text>
                  <Text
                    style={[
                      styles.characterCount,
                      sobreVoce.trim().length < 20 && styles.characterCountPending,
                    ]}
                  >
                    {sobreVoce.trim().length}/20 mínimo
                  </Text>
                </View>

                <Text style={styles.professionalFieldLabel}>
                  Máximo de cômodos atendidos <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.roomInput,
                    erroComodos && styles.inputError,
                  ]}
                  placeholder='Ex.: 8'
                  placeholderTextColor='#9B9B9B'
                  value={qtdMaxComodos}
                  onChangeText={(value) => {
                    setQtdMaxComodos(value.replace(/\D/g, ''));
                    setErroComodos('');
                  }}
                  keyboardType='number-pad'
                  maxLength={3}
                />
                {erroComodos ? (
                  <Text style={styles.inlineErrorStandalone}>{erroComodos}</Text>
                ) : (
                  <Text style={styles.fieldHelper}>
                    Altere o valor se você atender uma quantidade diferente.
                  </Text>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  Quais são os seus serviços individuais?
                </Text>

                <Text style={styles.sectionHint}>
                  Selecione no catálogo e informe quanto cobra por cada serviço.
                </Text>

                {carregandoServicos ? (
                  <ActivityIndicator color="#FF6B2C" />
                ) : erroServicos ? (
                  <Text style={styles.catalogError}>{erroServicos}</Text>
                ) : (
                  <View style={styles.servicesGrid}>
                    {servicos.map((servico) => {
                    const estaSelecionado =
                      servicosSelecionados.includes(servico.key);

                    return (
                      <TouchableOpacity
                        key={servico.key}
                        style={[
                          styles.serviceItem,
                          estaSelecionado &&
                            styles.serviceItemSelected,
                        ]}
                        onPress={() =>
                          alternarServicoIndividual(servico.key)
                        }
                        activeOpacity={0.8}
                      >
                        {estaSelecionado && (
                          <View style={styles.serviceCheck}>
                            <Ionicons
                              name="checkmark"
                              size={11}
                              color="#FFFFFF"
                            />
                          </View>
                        )}

                        <View
                          style={[
                            styles.servicePrice,
                            !estaSelecionado &&
                              styles.servicePriceUnselected,
                          ]}
                        >
                          <Text style={styles.servicePriceText}>
                            {servico.preco || 'Definir valor'}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.serviceName,
                            estaSelecionado &&
                              styles.serviceNameSelected,
                          ]}
                        >
                          {servico.nome_servico}
                        </Text>
                      </TouchableOpacity>
                    );
                    })}
                  </View>
                )}

                {servicos
                  .filter((servico) => servicosSelecionados.includes(servico.key))
                  .map((servico) => (
                    <View key={`preco-${servico.key}`} style={styles.selectedServiceRow}>
                      <Text style={styles.selectedServiceName}>{servico.nome_servico}</Text>
                      <TextInput
                        style={styles.selectedServicePriceInput}
                        placeholder="R$ 0,00"
                        placeholderTextColor="#FF6B2C"
                        value={servico.preco}
                        onChangeText={(value) => atualizarPrecoServico(servico.key, value)}
                        keyboardType="number-pad"
                        maxLength={18}
                      />
                    </View>
                  ))}

                <View style={styles.divider} />

                <Text style={styles.addServiceTitle}>
                  Adicionar novo serviço
                </Text>

                <Text style={styles.addServiceDescription}>
                  Informe o nome e digite o valor que será cobrado.
                </Text>

                <View style={styles.newServiceRow}>
                  <View style={styles.serviceFieldContainer}>
                    <Text style={styles.fieldLabel}>
                      Nome do serviço
                    </Text>

                    <TextInput
                      style={styles.newServiceInput}
                      placeholder="Ex.: Limpeza de janelas"
                      placeholderTextColor="#A0A0A0"
                      value={novoServico}
                      onChangeText={setNovoServico}
                    />
                  </View>

                  <View style={styles.valueFieldContainer}>
                    <Text style={styles.valueFieldLabel}>
                      Valor
                    </Text>

                    <TextInput
                      style={styles.valueInput}
                      placeholder="R$ 0,00"
                      placeholderTextColor="#FF6B2C"
                      value={novoValor}
                      onChangeText={handleNovoValor}
                      keyboardType="number-pad"
                      maxLength={18}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAdicionarServico}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={19}
                    color="#FF6B2C"
                  />

                  <Text style={styles.addButtonText}>
                    Adicionar serviço
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {etapa === 5 && (
              <View style={styles.packagesContent}>
                <Text style={styles.packageHelp}>
                  O combo reúne serviços por um valor único. Você poderá criar outros depois.
                </Text>

                <Text style={styles.professionalFieldLabel}>Nome do combo *</Text>
                <TextInput
                  style={styles.newServiceInput}
                  placeholder="Ex.: Limpeza completa"
                  placeholderTextColor="#A0A0A0"
                  value={nomeCombo}
                  onChangeText={setNomeCombo}
                  maxLength={100}
                />

                <Text style={styles.comboFieldLabel}>Descrição do combo</Text>
                <TextInput
                  style={styles.comboDescriptionInput}
                  placeholder="Explique o que está incluído neste combo"
                  placeholderTextColor="#A0A0A0"
                  value={descricaoCombo}
                  onChangeText={setDescricaoCombo}
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  Tamanhos de residência atendidos pelo combo
                </Text>

                <View style={styles.sizeOptions}>
                  {tamanhosResidencia.map((tamanho) => {
                    const estaSelecionado = tamanhosSelecionados.includes(tamanho.id);
                    return (
                      <TouchableOpacity
                        key={tamanho.id}
                        style={[styles.sizeButton, estaSelecionado && styles.sizeButtonSelected]}
                        onPress={() => alternarTamanho(tamanho.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.sizeButtonText, estaSelecionado && styles.sizeButtonTextSelected]}>
                          {tamanho.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.comboRoomsText}>
                  Limite do combo: até {qtdMaxComodos} cômodos
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  Serviços incluídos no combo
                </Text>

                <Text style={styles.sectionHint}>
                  São exibidos somente os serviços individuais selecionados na etapa anterior.
                </Text>

                <View style={styles.packageServicesGrid}>
                  {servicos
                    .filter((servico) => servicosSelecionados.includes(servico.key))
                    .map((servico) => {
                    const estaSelecionado =
                      servicosComboSelecionados.includes(servico.key);

                    return (
                      <TouchableOpacity
                        key={servico.key}
                        style={[
                          styles.packageServiceButton,
                          estaSelecionado &&
                            styles.packageServiceSelected,
                        ]}
                        onPress={() =>
                          alternarServicoCombo(servico.key)
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.packageServiceText,
                            estaSelecionado &&
                              styles.packageServiceTextSelected,
                          ]}
                        >
                          {servico.nome_servico}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.divider} />

                <Text style={styles.priceLabel}>
                  Valor total do combo *
                </Text>

                <View style={styles.packagePriceContainer}>
                  <Text style={styles.packagePriceDescription}>
                    Digite o valor do combo
                  </Text>

                  <TextInput
                    style={styles.packagePriceInput}
                    placeholder="R$ 0,00"
                    placeholderTextColor="#FF6B2C"
                    value={valorCombo}
                    onChangeText={handleValorCombo}
                    keyboardType="number-pad"
                    maxLength={18}
                  />
                </View>
              </View>
            )}

            {etapa === 6 && (
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
              style={[styles.mainButton, enviando && styles.mainButtonDisabled]}
              onPress={
                etapa < 6 ? handleProximo : handleEnviar
              }
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <Text style={styles.mainButtonText}>
                  {etapa < 6 ? 'Próximo' : 'Finalizar cadastro'}
                </Text>
              )}
            </TouchableOpacity>

            {etapa < 4 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Já tem uma conta?{' '}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Login')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginText}>
                    Entre agora
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CadastroConcluidoModal
        visible={cadastroConcluido}
        perfil='diarista'
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
