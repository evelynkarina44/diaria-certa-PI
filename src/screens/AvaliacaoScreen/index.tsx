import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { reportAttachmentService, reviewAttachmentService, type ReportImage } from '../../services/reportAttachmentService';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { PageHeader } from '../../components/page-header';
import React, { useEffect, useRef, useState } from 'react';
import { ActionModal } from '../../components/action-modal';

import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles as baseStyles } from './styles';
import { avaliacaoService } from '../../services/avaliacaoService';
import { denunciaService } from '../../services/denunciaService';
import { getErrorMessage } from '../../services/api';
import { agendamentoService } from '../../services/agendamentoService';
import { pagamentoService } from '../../services/pagamentoService';
import { StarRating } from '../../components/star-rating';

export default function AvaliacaoScreen({ navigation, route }: any) {
  return <AvaliacaoDaDiaria key={String(route.params?.agendamentoId) + ':' + Boolean(route.params?.avaliarCliente)} navigation={navigation} route={route} />;
}

function AvaliacaoDaDiaria({ navigation, route }: any) {
  const { desktop } = useResponsive();
  const styles = desktop ? { ...baseStyles,
    content: [baseStyles.content, baseStyles.desktopForm],
    title: [baseStyles.title, baseStyles.desktopTitle],
    commentInput: [baseStyles.commentInput, baseStyles.desktopComment],
    bottomArea: [baseStyles.bottomArea, baseStyles.desktopBottom],
    sendButton: [baseStyles.sendButton, baseStyles.desktopSend],
    sendButtonText: [baseStyles.sendButtonText, baseStyles.desktopButtonText],
    reportInput: [baseStyles.reportInput, baseStyles.desktopReportInput],
    reportSendButton: [baseStyles.reportSendButton, baseStyles.desktopSend],
    scroll: [baseStyles.scroll, baseStyles.desktopScroll],
  } : baseStyles;
  const [avaliacao, setAvaliacao] = useState(0);
  const [comentario, setComentario] = useState('');

  const [modoDenuncia, setModoDenuncia] = useState(false);
  const [denuncia, setDenuncia] = useState('');

  const [imagens, setImagens] = useState<ReportImage[]>([]);
  const [reviewMedia, setReviewMedia] = useState<ReportImage[]>([]);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const reviewCreated = useRef<number | null>(null), uploadedReviewMedia = useRef(0);
  const [reportId, setReportId] = useState<number | null>(null);
  const uploadedImages = useRef(0), reportLock = useRef(false), reportSent = useRef(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const agendamentoId = Number(route.params?.agendamentoId);
  const avaliarCliente = route.params?.avaliarCliente === true;
  const accentColor = avaliarCliente ? '#FF6B2C' : '#18C7C8';
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
        setNomeDiarista(avaliarCliente ? booking.cliente?.usuario?.nome ?? 'cliente' : booking.diarista?.usuario?.nome ?? 'diarista');
        setIdUsuarioDenunciado(avaliarCliente ? booking.cliente?.id_usuario ?? 0 : booking.diarista?.id_usuario ?? 0);
        const previous = avaliarCliente ? summary.avaliacao_diarista : summary.avaliacao_cliente;
        const allowed = avaliarCliente ? summary.pode_avaliar_cliente : summary.pode_avaliar;
        if (previous) {
          setAvaliacao(previous!.nota);
          setComentario(previous!.comentario ?? '');
          setSaved(true);
        } else if (!allowed) {
          setError(avaliarCliente ? 'A avaliação do cliente é liberada após o checkout.' : 'A avaliação será liberada após a conclusão da diária e a aprovação das duas parcelas.'); return;
        }
        setReady(true);
      } catch (cause) { if (active) setError(getErrorMessage(cause)); }
    }
    void load();
    return () => { active = false; };
  }, [agendamentoId, avaliarCliente]);

  function selecionarAvaliacao(valor: number) {
    // A seleção é local; somente o envio depende da validação da diária na API.
    if (saved || loading || reviewId) return;
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

  async function adicionarImagem(paraAvaliacao = false) {
    const selectedMedia = paraAvaliacao ? reviewMedia : imagens;
    if (reportLock.current || loading || (paraAvaliacao ? saved : reportSent.current) || selectedMedia.length >= 3) return;
    reportLock.current = true; setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) throw new Error('Permita o acesso à galeria para anexar fotos ou vídeos.');
      }
      const selected = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsEditing: false, quality: 0.85, base64: true, allowsMultipleSelection: false, videoMaxDuration: 60 });
      if (selected.canceled) return;
      const asset = selected.assets[0];
      if (!asset?.uri) throw new Error('Não foi possível ler o arquivo.');
      const video = asset.type === 'video';
      const limit = (video ? 10 : 5) * 1024 * 1024;
      if ((asset.fileSize ?? asset.file?.size ?? 0) > limit) throw new Error(video ? 'O vídeo deve ter até 10 MB.' : 'A foto deve ter até 5 MB.');
      if (video && (asset.duration ?? 0) > 60000) throw new Error('O vídeo deve ter até 1 minuto.');
      if (video && asset.mimeType && asset.mimeType !== 'video/mp4') throw new Error('Selecione um vídeo MP4 (H.264). Outros formatos precisam ser convertidos antes do envio.');
      const media: ReportImage = { uri: asset.uri, base64: video ? undefined : asset.base64 ?? undefined, file: asset.file,
        type: video ? 'video' : 'image', name: asset.fileName || (video ? 'Vídeo' : 'Foto') + ' ' + (selectedMedia.length + 1),
        key: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2) };
      (paraAvaliacao ? setReviewMedia : setImagens)(current => current.length >= 3 ? current : [...current, media]);
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { reportLock.current = false; setLoading(false); }
  }

  function removerImagem(index: number) {
    if (loading || reportSent.current || index < uploadedImages.current) return;
    setImagens((listaAtual) =>
      listaAtual.filter((_, indice) => indice !== index)
    );
  }

  async function enviarAvaliacao(confirmed = false) {
    if (sending.current || loading || !ready || saved) return;
    if (avaliacao < 1 || avaliacao > 5) { setError('Escolha uma nota de 1 a 5 estrelas.'); return; }
    if (comentario.trim().length > 2000) { setError('O comentário deve ter no máximo 2000 caracteres.'); return; }
    if (!confirmed) { setConfirmReview(true); return; }
    sending.current = true;
    setError('');
    try {
      setLoading(true);
      let id = reviewCreated.current;
      if (!id) {
      const result = await avaliacaoService.criar({
        id_agendamento: agendamentoId,
        nota: avaliacao,
        comentario: comentario.trim() || null,
        publica: true,
        anonima: false,
      });
      id = result.id_avaliacao; reviewCreated.current = id; setReviewId(id);
      }
      for (let i = uploadedReviewMedia.current; i < reviewMedia.length; i++) {
        await reviewAttachmentService.upload(id, reviewMedia[i]);
        uploadedReviewMedia.current = i + 1;
      }
      setSaved(true);
      setConfirmReview(false);
      setSuccessNotice(avaliarCliente ? 'Sua avaliação do cliente foi registrada. Obrigado!' : 'Sua avaliação da diarista foi registrada. Obrigado!');
    } catch (error) {
      setConfirmReview(false);
      setError((reviewCreated.current ? 'A avaliação foi registrada. Tente novamente para concluir os anexos. Se um arquivo foi recusado, remova ou substitua apenas o arquivo pendente, sem duplicar a avaliação. ' : '') + getErrorMessage(error));
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  async function enviarDenuncia() {
    if (reportLock.current || loading || reportSent.current) return;
    if (!idUsuarioDenunciado || !denuncia.trim()) { setError('Informe a denúncia e abra esta tela por uma diária.'); return; }
    reportLock.current = true; setLoading(true);
    try {
      let id = reportId;
      if (!id) {
        const result = await denunciaService.criar({ id_usuario_denunciado: idUsuarioDenunciado, motivo: 'outro', descricao: denuncia.trim() });
        id = result.id_denuncia; setReportId(id);
      }
      for (let i = uploadedImages.current; i < imagens.length; i++) {
        await reportAttachmentService.upload(id, imagens[i]);
        uploadedImages.current = i + 1;
      }
      reportSent.current = true;
      setReportSuccess(true);
    } catch (cause) {
      setError('Não foi possível concluir o envio. Se o relato já foi registrado, tente novamente para anexar os arquivos restantes. Arquivos recusados ainda não enviados podem ser removidos ou substituídos, sem duplicar a denúncia. ' + getErrorMessage(cause));
    } finally { reportLock.current = false; setLoading(false); }
  }

  const question = (<>            <Text style={styles.title}>
              {avaliarCliente ? 'Como foi sua experiência com' : 'Como foi o serviço de'}{'\n'}
              {nomeDiarista}?
            </Text>

            {/* ESTRELAS */}
            <StarRating value={avaliacao} onChange={selecionarAvaliacao} disabled={saved || loading || Boolean(reviewId)} />

            <View style={styles.divider} />
            {avaliacao > 0 && <Text accessibilityLiveRegion="polite" style={{ textAlign: 'center', color: '#555555', marginBottom: 12 }}>Nota: {avaliacao} de 5 estrelas</Text>}

</>);
  const reviewForm = (<>            {/* COMENTÁRIO */}
            <TextInput
              style={styles.commentInput}
              placeholder="Deixe um comentário... (opcional)"
              placeholderTextColor="#9B9B9B"
              value={comentario}
              onChangeText={setComentario}
              editable={ready && !saved && !loading && !reviewId}
              maxLength={2000}
              accessibilityLabel={avaliarCliente ? "Comentário sobre o cliente" : "Comentário sobre a diarista"}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.attachmentsList}>
              <Text style={styles.attachmentTitle}>Fotos e vídeos (opcional · até 3)</Text>
              <Text style={styles.noAttachments}>Fotos até 5 MB · MP4 (H.264) até 10 MB e 1 minuto. Os anexos acompanham sua avaliação pública.</Text>
              {reviewMedia.map((media, index) => <View key={media.key ?? String(index)} style={styles.attachmentItem}>
                <Ionicons name={media.type === 'video' ? 'videocam-outline' : 'image-outline'} size={18} color="#008A99" />
                <Text style={styles.attachmentName} numberOfLines={1}>{media.name}{index < uploadedReviewMedia.current ? ' · Enviado' : ''}</Text>
                <TouchableOpacity accessibilityLabel={'Remover anexo da avaliação ' + (index + 1)} disabled={loading || index < uploadedReviewMedia.current || saved}
                  onPress={() => { if (!loading && !saved && index >= uploadedReviewMedia.current) setReviewMedia(current => current.filter((_, i) => i !== index)); }} style={styles.removeAttachment}>
                  <Ionicons name="close" size={18} color="#667085" />
                </TouchableOpacity>
              </View>)}
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Anexar foto ou vídeo à avaliação" style={styles.uploadButton}
                disabled={!ready || loading || saved || reviewMedia.length >= 3} onPress={() => void adicionarImagem(true)}>
                <Text style={styles.uploadButtonText}>Anexar foto ou vídeo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomArea}>
              {/* DENÚNCIA SOMENTE COM 1 ESTRELA */}
              {avaliacao === 1 && ready && !saved && !reviewId && (
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
                style={[styles.sendButton, { backgroundColor: accentColor }]}
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
</>);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <PageHeader title={avaliarCliente ? "Avaliar cliente" : "Avaliar serviço"} accentColor={accentColor} onBack={voltar} allowBackWithSidebar={desktop} compact={desktop}
        subtitle={desktop ? "Compartilhe sua experiência após a diária." : undefined} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[baseStyles.scrollContent, desktop && baseStyles.desktopContent]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {saved && <View style={{ padding: 18 }}>

          <TouchableOpacity onPress={() => navigation.navigate(avaliarCliente ? 'MinhasDiariasDiarista' : 'MinhasDiariasCliente')}><Text style={{ color: '#008A99', marginTop: 16 }}>Voltar às minhas diárias</Text></TouchableOpacity>
        </View>}
        {!modoDenuncia ? (
          /* =========================================
             AVALIAÇÃO NORMAL
          ========================================= */
          <View style={styles.content}>
            {desktop ? <View style={baseStyles.desktopColumns}>
              <View style={baseStyles.desktopRatingPanel}>{question}</View>
              <View style={baseStyles.desktopFormPanel}>{reviewForm}</View>
            </View> : <>{question}{reviewForm}</>}
          </View>
        ) : (
          /* =========================================
             DENÚNCIA
          ========================================= */
          <View style={styles.content}>
            <Text style={styles.title}>
              {avaliarCliente ? 'Como foi sua experiência com' : 'Como foi o serviço de'}{'\n'}
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
              editable={!loading && !reportId}
              maxLength={2000}
              onChangeText={setDenuncia}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.noAttachments}>Fotos até 5 MB · Vídeos MP4 (H.264) até 10 MB e 1 minuto. Anexos privados para você e a administração.</Text>
            {/* ANEXOS */}
            <View style={styles.attachmentHeader}>
              <Text style={styles.attachmentTitle}>
                Fotos e vídeos (até 3)
              </Text>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  (imagens.length >= 3 || loading || reportSent.current) &&
                    styles.uploadButtonDisabled,
                ]}
                onPress={() => void adicionarImagem()}
                disabled={imagens.length >= 3 || loading || reportSent.current}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={14}
                  color="#555555"
                />

                <Text style={styles.uploadButtonText}>
                  Anexar
                </Text>
              </TouchableOpacity>
            </View>

            {/* IMAGENS SELECIONADAS */}
            <View style={styles.attachmentsList}>
              {imagens.map((imagem, index) => (
                <View
                  key={`${imagem.name}-${index}`}
                  style={styles.attachmentItem}
                >
                  <Ionicons
                    name={imagem.type === 'video' ? 'videocam-outline' : 'image-outline'}
                    size={15}
                    color="#A0A0A0"
                  />

                  <Text
                    style={styles.attachmentName}
                    numberOfLines={1}
                  >
                    {imagem.name}{index < uploadedImages.current ? ' · Enviado' : ''}
                  </Text>

                  <TouchableOpacity
                    accessibilityLabel={'Remover anexo da denúncia ' + (index + 1)}
                    style={styles.removeAttachment}
                    onPress={() => removerImagem(index)}
                    disabled={loading || reportSent.current || index < uploadedImages.current}
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
                  Nenhuma foto ou vídeo anexado
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.reportSendButton}
              onPress={enviarDenuncia}
              disabled={loading || reportSent.current}
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
      <ActionModal visible={reportSuccess && !error} variant="success" title="Denúncia enviada"
        message="Sua denúncia foi enviada com sucesso e será analisada pela moderação. Obrigado por ajudar a manter a comunidade segura."
        confirmLabel="Entendi" onClose={() => { setReportSuccess(false); navigation.navigate(avaliarCliente ? 'HomeDiarista' : 'EncontrarDiarista'); }} />
      <ActionModal visible={Boolean(error)} variant="error" title="Confira os dados" message={error} onClose={() => setError('')} />
      <ActionModal visible={confirmReview && !error} variant="confirm" title="Enviar avaliação?"
        message={`Deseja enviar a nota ${avaliacao} de 5 estrelas${comentario.trim() ? ' e seu comentário' : ''} para esta diária?`}
        confirmLabel="Enviar avaliação" cancelLabel="Revisar" busy={loading}
        onConfirm={() => enviarAvaliacao(true)} onClose={() => setConfirmReview(false)} />
      <ActionModal visible={Boolean(successNotice) && !error} variant="success" title="Avaliação enviada"
        message={successNotice} confirmLabel="Voltar às minhas diárias"
        onClose={() => { setSuccessNotice(''); navigation.navigate(avaliarCliente ? 'MinhasDiariasDiarista' : 'MinhasDiariasCliente'); }} />
    </SafeAreaView>
  );
}
