import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { avaliacaoService } from '../../services/avaliacaoService';
import { denunciaService } from '../../services/denunciaService';
import { getErrorMessage } from '../../services/api';

export default function AvaliacaoScreen({ navigation, route }: any) {
  const [avaliacao, setAvaliacao] = useState(4);
  const [comentario, setComentario] = useState('');

  const [modoDenuncia, setModoDenuncia] = useState(false);
  const [denuncia, setDenuncia] = useState('');

  const [imagens, setImagens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const agendamentoId = Number(route.params?.agendamentoId);
  const idUsuarioDenunciado = Number(route.params?.idUsuarioDenunciado);

  function selecionarAvaliacao(valor: number) {
    setAvaliacao(valor);

    // Se mudar a nota, volta para a avaliação normal.
    if (valor !== 1) {
      setModoDenuncia(false);
    }
  }

  function abrirDenuncia() {
    setModoDenuncia(true);
  }

  function voltar() {
    if (modoDenuncia) {
      setModoDenuncia(false);
      return;
    }

    navigation.goBack();
  }

  function adicionarImagem() {
    if (imagens.length >= 3) {
      return;
    }

    const numero = imagens.length + 1;

    setImagens((listaAtual) => [
      ...listaAtual,
      `Imagem WhatsApp ${numero}.png`,
    ]);
  }

  function removerImagem(index: number) {
    setImagens((listaAtual) =>
      listaAtual.filter((_, indice) => indice !== index)
    );
  }

  async function enviarAvaliacao() {
    if (!agendamentoId) {
      Alert.alert('Agendamento ausente', 'Abra a avaliação pelo histórico.');
      return;
    }
    try {
      setLoading(true);
      await avaliacaoService.criar({
        id_agendamento: agendamentoId,
        nota: avaliacao,
        comentario: comentario.trim() || null,
        publica: true,
        anonima: false,
      });
      navigation.navigate('EncontrarDiarista');
    } catch (error) {
      Alert.alert('Não foi possível enviar a avaliação', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function enviarDenuncia() {
    if (!idUsuarioDenunciado || !denuncia.trim()) {
      Alert.alert('Dados incompletos', 'Informe a denúncia e abra esta tela por uma diária.');
      return;
    }
    try {
      setLoading(true);
      await denunciaService.criar({
        id_usuario_denunciado: idUsuarioDenunciado,
        motivo: 'outro',
        descricao: denuncia.trim(),
      });
      navigation.navigate('EncontrarDiarista');
    } catch (error) {
      Alert.alert('Não foi possível enviar a denúncia', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={voltar}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Avaliar serviço
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!modoDenuncia ? (
          /* =========================================
             AVALIAÇÃO NORMAL
          ========================================= */
          <View style={styles.content}>
            <Text style={styles.title}>
              Como foi o serviço de{'\n'}
              Maria da Silva?
            </Text>

            {/* ESTRELAS */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((estrela) => (
                <TouchableOpacity
                  key={estrela}
                  style={styles.starButton}
                  onPress={() =>
                    selecionarAvaliacao(estrela)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      estrela <= avaliacao
                        ? 'star'
                        : 'star-outline'
                    }
                    size={35}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            {/* COMENTÁRIO */}
            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário... (opcional)"
              placeholderTextColor="#9B9B9B"
              value={comentario}
              onChangeText={setComentario}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.bottomArea}>
              {/* DENÚNCIA SOMENTE COM 1 ESTRELA */}
              {avaliacao === 1 && (
                <View style={styles.reportArea}>
                  <Text style={styles.reportDescription}>
                    Se deseja criar uma denúncia, clique no botão
                    abaixo:
                  </Text>

                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={abrirDenuncia}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reportButtonText}>
                      Denúncia
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.sendButton}
                onPress={enviarAvaliacao}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={'#FFFFFF'} />
                ) : (
                  <Text style={styles.sendButtonText}>
                    Enviar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* =========================================
             DENÚNCIA
          ========================================= */
          <View style={styles.content}>
            <Text style={styles.title}>
              Como foi o serviço de{'\n'}
              Maria da Silva?
            </Text>

            {/* CAMPO DA DENÚNCIA */}
            <TextInput
              style={styles.reportInput}
              placeholder={
                'Escreva a sua denúncia\ndetalhada (Obrigatório)'
              }
              placeholderTextColor="#9B9B9B"
              value={denuncia}
              onChangeText={setDenuncia}
              multiline
              textAlignVertical="top"
            />

            {/* ANEXOS */}
            <View style={styles.attachmentHeader}>
              <Text style={styles.attachmentTitle}>
                Anexo de imagens (Máx de 3)
              </Text>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  imagens.length >= 3 &&
                    styles.uploadButtonDisabled,
                ]}
                onPress={adicionarImagem}
                disabled={imagens.length >= 3}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={14}
                  color="#555555"
                />

                <Text style={styles.uploadButtonText}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>

            {/* IMAGENS SIMULADAS */}
            <View style={styles.attachmentsList}>
              {imagens.map((imagem, index) => (
                <View
                  key={`${imagem}-${index}`}
                  style={styles.attachmentItem}
                >
                  <Ionicons
                    name="image-outline"
                    size={15}
                    color="#A0A0A0"
                  />

                  <Text
                    style={styles.attachmentName}
                    numberOfLines={1}
                  >
                    {imagem}
                  </Text>

                  <TouchableOpacity
                    style={styles.removeAttachment}
                    onPress={() => removerImagem(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {imagens.length === 0 && (
                <Text style={styles.noAttachments}>
                  Nenhuma imagem anexada
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.reportSendButton}
              onPress={enviarDenuncia}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={'#FFFFFF'} />
              ) : (
                <Text style={styles.sendButtonText}>
                  Enviar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
