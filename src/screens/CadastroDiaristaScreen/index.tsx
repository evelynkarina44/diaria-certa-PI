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

type ServicoIndividual = {
  id: number;
  nome: string;
  valor: string;
};

type Pacote = {
  id: string;
  nome: string;
};

const tamanhosResidencia = [
  'Até 60m²',
  'Até 120m²',
  'Acima de 120m²',
];

const servicosIniciais: ServicoIndividual[] = [
  {
    id: 1,
    nome: 'Limpeza Geral',
    valor: 'R$ 100,00',
  },
  {
    id: 2,
    nome: 'Passar Roupas',
    valor: 'R$ 30,00',
  },
  {
    id: 3,
    nome: 'Limpeza Pesada',
    valor: 'R$ 130,00',
  },
  {
    id: 4,
    nome: 'Cozinha',
    valor: 'R$ 80,00',
  },
];

const tiposPacote: Pacote[] = [
  {
    id: 'leve',
    nome: 'Leve',
  },
  {
    id: 'pesado',
    nome: 'Pesado',
  },
  {
    id: 'completo',
    nome: 'Completo',
  },
];

const opcoesServicosPacote = [
  'Aspirador em móveis',
  'Passar roupas',
  'Piscina',
  'Banheiro',
  'Lavar louça',
  'Limpeza em móveis',
  'Pano em chão',
  'Jardim',
];

export default function CadastroDiaristaScreen({ navigation }: any) {
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

  const [sobreVoce, setSobreVoce] = useState('');

  const [tamanhoSelecionado, setTamanhoSelecionado] =
    useState('Até 60m²');

  const [servicos, setServicos] =
    useState<ServicoIndividual[]>(servicosIniciais);

  const [servicosSelecionados, setServicosSelecionados] = useState<
    number[]
  >(servicosIniciais.map((servico) => servico.id));

  const [novoServico, setNovoServico] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const [pacoteSelecionado, setPacoteSelecionado] =
    useState('pesado');

  const [servicosPacoteSelecionados, setServicosPacoteSelecionados] =
    useState<string[]>([
      'Aspirador em móveis',
      'Passar roupas',
      'Lavar louça',
      'Limpeza em móveis',
      'Pano em chão',
    ]);

  const [precoPacote, setPrecoPacote] = useState('');

  const progresso = `${etapa * 20}%` as `${number}%`;

  function handleProximo() {
    if (etapa < 5) {
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

  function alternarServicoIndividual(id: number) {
    setServicosSelecionados((selecionadosAtuais) => {
      const estaSelecionado = selecionadosAtuais.includes(id);

      if (estaSelecionado) {
        return selecionadosAtuais.filter(
          (servicoId) => servicoId !== id
        );
      }

      return [...selecionadosAtuais, id];
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

  function handlePrecoPacote(valor: string) {
    setPrecoPacote(formatarValorEmReais(valor));
  }

  function handleAdicionarServico() {
    if (!novoServico.trim()) {
      return;
    }

    const novoId = Date.now();

    const servicoAdicionado: ServicoIndividual = {
      id: novoId,
      nome: novoServico.trim(),
      valor: novoValor || 'R$ 0,00',
    };

    setServicos((servicosAtuais) => [
      ...servicosAtuais,
      servicoAdicionado,
    ]);

    setServicosSelecionados((selecionadosAtuais) => [
      ...selecionadosAtuais,
      novoId,
    ]);

    setNovoServico('');
    setNovoValor('');
  }

  function alternarServicoPacote(servico: string) {
    setServicosPacoteSelecionados((selecionadosAtuais) => {
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
        return 'Quais são os pacotes oferecidos?';

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

      default:
        return '';
    }
  }

  function getNomePacoteSelecionado() {
    const pacote = tiposPacote.find(
      (item) => item.id === pacoteSelecionado
    );

    return pacote?.nome ?? '';
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
              Etapa {etapa} de 5
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
                <TextInput
                  style={styles.aboutInput}
                  placeholder="Trabalho como diarista há 4 anos, sou organizada e de confiança."
                  placeholderTextColor="#9B9B9B"
                  value={sobreVoce}
                  onChangeText={setSobreVoce}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.divider} />

                <Text style={styles.sectionDescription}>
                  Informe as limitações exigidas em relação ao
                  tamanho de residência aceita.
                </Text>

                <View style={styles.sizeOptions}>
                  {tamanhosResidencia.map((tamanho) => {
                    const estaSelecionado =
                      tamanhoSelecionado === tamanho;

                    return (
                      <TouchableOpacity
                        key={tamanho}
                        style={[
                          styles.sizeButton,
                          estaSelecionado &&
                            styles.sizeButtonSelected,
                        ]}
                        onPress={() =>
                          setTamanhoSelecionado(tamanho)
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            estaSelecionado &&
                              styles.sizeButtonTextSelected,
                          ]}
                        >
                          {tamanho}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  Quais são os seus serviços individuais?
                </Text>

                <Text style={styles.sectionHint}>
                  Toque nos serviços para selecionar ou desmarcar.
                </Text>

                <View style={styles.servicesGrid}>
                  {servicos.map((servico) => {
                    const estaSelecionado =
                      servicosSelecionados.includes(servico.id);

                    return (
                      <TouchableOpacity
                        key={servico.id}
                        style={[
                          styles.serviceItem,
                          estaSelecionado &&
                            styles.serviceItemSelected,
                        ]}
                        onPress={() =>
                          alternarServicoIndividual(servico.id)
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
                            {servico.valor}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.serviceName,
                            estaSelecionado &&
                              styles.serviceNameSelected,
                          ]}
                        >
                          {servico.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

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
                <View style={styles.packageCards}>
                  {tiposPacote.map((pacote) => {
                    const estaSelecionado =
                      pacoteSelecionado === pacote.id;

                    return (
                      <TouchableOpacity
                        key={pacote.id}
                        style={styles.packageOption}
                        onPress={() =>
                          setPacoteSelecionado(pacote.id)
                        }
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.packageCard,
                            pacote.id === 'leve' &&
                              styles.lightPackage,
                            pacote.id === 'pesado' &&
                              styles.heavyPackage,
                            pacote.id === 'completo' &&
                              styles.completePackage,
                            estaSelecionado &&
                              styles.packageCardSelected,
                          ]}
                        >
                          {estaSelecionado && (
                            <View style={styles.checkIcon}>
                              <Ionicons
                                name="checkmark"
                                size={11}
                                color="#FFFFFF"
                              />
                            </View>
                          )}
                        </View>

                        <Text style={styles.packageName}>
                          {pacote.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.packageHelp}>
                  Toque em cada pacote para definir os serviços
                  oferecidos.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  O que o pacote {getNomePacoteSelecionado()} irá
                  oferecer?
                </Text>

                <View style={styles.packageServicesGrid}>
                  {opcoesServicosPacote.map((servico) => {
                    const estaSelecionado =
                      servicosPacoteSelecionados.includes(
                        servico
                      );

                    return (
                      <TouchableOpacity
                        key={servico}
                        style={[
                          styles.packageServiceButton,
                          estaSelecionado &&
                            styles.packageServiceSelected,
                        ]}
                        onPress={() =>
                          alternarServicoPacote(servico)
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
                          {servico}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.divider} />

                <Text style={styles.priceLabel}>
                  Definir preço para:{' '}
                  {getNomePacoteSelecionado()}
                </Text>

                <View style={styles.packagePriceContainer}>
                  <Text style={styles.packagePriceDescription}>
                    Digite o valor do pacote
                  </Text>

                  <TextInput
                    style={styles.packagePriceInput}
                    placeholder="R$ 0,00"
                    placeholderTextColor="#FF6B2C"
                    value={precoPacote}
                    onChangeText={handlePrecoPacote}
                    keyboardType="number-pad"
                    maxLength={18}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.mainButton}
              onPress={
                etapa < 5 ? handleProximo : handleEnviar
              }
              activeOpacity={0.85}
            >
              <Text style={styles.mainButtonText}>
                {etapa < 5 ? 'Próximo' : 'Enviar'}
              </Text>
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
    </SafeAreaView>
  );
}