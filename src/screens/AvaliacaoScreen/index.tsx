import { PageHeader } from '../../components/page-header';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';

import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { avaliacaoService } from '../../services/avaliacaoService';
import { denunciaService } from '../../services/denunciaService';
import { getErrorMessage } from '../../services/api';
import { agendamentoService } from '../../services/agendamentoService';
import { pagamentoService } from '../../services/pagamentoService';
import { StarRating } from '../../components/star-rating';

export default function AvaliacaoScreen({ navigation, route }: any) {
  return <AvaliacaoDaDiaria key={route.params?.agendamentoId} navigation={navigation} route={route} />;
}

function AvaliacaoDaDiaria({ navigation, route }: any) {
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');

  const [modoDenuncia, setModoDenuncia] = useState(false);
  const [denuncia, setDenuncia] = useState('');

  const [imagens, setImagens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const agendamentoId = Number(route.params?.agendamentoId);
  const [idUsuarioDenunciado, setIdUsuarioDenunciado] = useState(0);
  const [nomeDiarista, setNomeDiarista] = useState('diarista');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmReview, setConfirmReview] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const sending = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!Number.isSafeInteger(agendamentoId) || agendamentoId <= 0) {
        setError('Abra a avaliação pelo pagamento de uma diária.'); return;
      }
      try {
        const [booking, summary] = await Promise.all([
          agendamentoService.buscarPorId(agendamentoId), pagamentoService.buscar(agendamentoId),
        ]);
        if (!active) return;
        setNomeDiarista(booking.diarista?.usuario?.nome ?? 'diarista');
        setIdUsuarioDenunciado(booking.diarista?.id_usuario ?? 0);
        if (summary.avaliacao_cliente) {
          setAvaliacao(summary.avaliacao_cliente.nota);
          setComentario(summary.avaliacao_cliente.comentario ?? '');
          setSaved(true);
        } else if (!summary.pode_avaliar) {
          setError('A avaliação será liberada após a conclusão da diária e a aprovação das duas parcelas.'); return;
        }
        setReady(true);
      } catch (cause) { if (active) setError(getErrorMessage(cause)); }
    }
    void load();
    return () => { active = false; };
  }, [agendamentoId]);

  function selecionarAvaliacao(valor: number) {
    // A seleção é local; somente o envio depende da validação da diária na API.
    if (saved || loading) return;
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

  async function enviarAvaliacao(confirmed = false) {
    if (sending.current || !ready || saved) return;
    if (avaliacao < 1 || avaliacao > 5) { setError('Escolha uma nota de 1 a 5 estrelas.'); return; }
    if (comentario.trim().length > 2000) { setError('O comentário deve ter no máximo 2000 caracteres.'); return; }
    if (!confirmed) { setConfirmReview(true); return; }
    sending.current = true;
    setError('');
    try {
      setLoading(true);
      await avaliacaoService.criar({
        id_agendamento: agendamentoId,
        nota: avaliacao,
        comentario: comentario.trim() || null,
        publica: true,
        anonima: false,
      });
      setSaved(true);
      setConfirmReview(false);
      setSuccessNotice('Sua avaliação da diarista foi registrada. Obrigado!');
    } catch (error) {
      setConfirmReview(false);
      setError(getErrorMessage(error));
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  async function enviarDenuncia() {
    if (!idUsuarioDenunciado || !denuncia.trim()) {
      setError('Informe a denúncia e abra esta tela por uma diária.');
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
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <PageHeader title="Avaliar serviço" accentColor="#18C7C8" onBack={voltar} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {saved && <View style={{ padding: 18 }}>

          <TouchableOpacity onPress={() => navigation.navigate('AcompanharDiarias')}><Text style={{ color: '#008A99', marginTop: 16 }}>Voltar às minhas diárias</Text></TouchableOpacity>
        </View>}
        {!modoDenuncia ? (
          /* =========================================
             AVALIAÇÃO NORMAL
          ========================================= */
          <View style={styles.content}>
            <Text style={styles.title}>
              Como foi o serviço de{'\n'}
              {nomeDiarista}?
            </Text>

            {/* ESTRELAS */}
            <StarRating value={avaliacao} onChange={selecionarAvaliacao} disabled={saved || loading} />

            <View style={styles.divider} />
            {avaliacao > 0 && <Text accessibilityLiveRegion="polite" style={{ textAlign: 'center', color: '#555555', marginBottom: 12 }}>Nota: {avaliacao} de 5 estrelas</Text>}

            {/* COMENTÁRIO */}
            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário... (opcional)"
              placeholderTextColor="#9B9B9B"
              value={comentario}
              onChangeText={setComentario}
              editable={ready && !saved && !loading}
              maxLength={2000}
              accessibilityLabel="Comentário sobre a diarista"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.bottomArea}>
              {/* DENÚNCIA SOMENTE COM 1 ESTRELA */}
              {avaliacao === 1 && ready && !saved && (
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
                onPress={() => void enviarAvaliacao()}
                disabled={loading || !ready || saved}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={'#FFFFFF'} />
                ) : (
                  <Text style={styles.sendButtonText}>
                    {saved ? 'Avaliação enviada' : 'Enviar avaliação'}
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
              {nomeDiarista}?
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
      <ActionModal visible={Boolean(error)} variant="error" title="Confira os dados" message={error} onClose={() => setError('')} />
      <ActionModal visible={confirmReview && !error} variant="confirm" title="Enviar avaliação?"
        message={`Deseja enviar a nota ${avaliacao} de 5 estrelas${comentario.trim() ? ' e seu comentário' : ''} para esta diária?`}
        confirmLabel="Enviar avaliação" cancelLabel="Revisar" busy={loading}
        onConfirm={() => enviarAvaliacao(true)} onClose={() => setConfirmReview(false)} />
      <ActionModal visible={Boolean(successNotice) && !error} variant="success" title="Avaliação enviada"
        message={successNotice} confirmLabel="Voltar às minhas diárias"
        onClose={() => { setSuccessNotice(''); navigation.navigate('AcompanharDiarias'); }} />
    </SafeAreaView>
  );
}
