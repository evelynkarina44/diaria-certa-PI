// APRESENTACAO | PESSOA 3 | ETAPA 7 — Demonstração: preferir a aplicação no navegador.
// Código de apoio: send() envia, proposalAction() confirma/cancela e openConversation() retoma chats.
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HeaderMenu } from '../../components/header-menu';
import { useAuth } from '../../contexts/GlobalContext';
import { chatbotService, type ChatbotConversation, type ChatbotMessageInput, type ChatbotOption } from '../../services/chatbotService';
import { getErrorMessage } from '../../services/api';
import { styles } from './styles';
import { splitMessagesAtProposal } from './conversationTimeline';
import { ChatbotHistoryPanel } from './history-panel';

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const requestId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (letter) => {
  const value = Math.floor(Math.random() * 16);
  return (letter === 'x' ? value : (value & 3) | 8).toString(16);
});

export default function ChatbotScreen({ navigation }: any) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failedInput, setFailedInput] = useState<ChatbotMessageInput | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [openingConversation, setOpeningConversation] = useState<string | null>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const mounted = useRef(true);
  const pending = useRef(false);
  const sessionEpoch = useRef(0);
  const isClient = user?.activeProfile === 'CLIENTE';

  useEffect(() => {
    const epoch = ++sessionEpoch.current;
    mounted.current = true;
    pending.current = false;
    setConversation(null); setMessage(''); setError(''); setFailedInput(null); setBusy(false);
    setHistoryOpen(false); setHistoryError(''); setOpeningConversation(null);
    if (!isClient) { setLoading(false); return () => { mounted.current = false; sessionEpoch.current++; }; }
    setLoading(true);
    chatbotService.iniciar().then((result) => { if (mounted.current && epoch === sessionEpoch.current) setConversation(result); })
      .catch((cause) => { if (mounted.current && epoch === sessionEpoch.current) setError(getErrorMessage(cause)); })
      .finally(() => { if (mounted.current && epoch === sessionEpoch.current) setLoading(false); });
    return () => { mounted.current = false; sessionEpoch.current++; };
  }, [user?.id_usuario, isClient]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  async function refresh() {
    if (!conversation) return;
    const epoch = sessionEpoch.current;
    const result = await chatbotService.buscar(conversation.id_conversa);
    if (mounted.current && epoch === sessionEpoch.current) setConversation(result);
  }

  // APOIO | PESSOA 1 | ETAPA 2 — Interface -> service HTTP; evitar envios simultâneos na tela.
  async function send(input?: ChatbotMessageInput) {
    if (!conversation || pending.current) return;
    const text = message.trim();
    if (!input && !text) return;
    const data = input || { id_requisicao: requestId(), mensagem: text };
    const epoch = sessionEpoch.current;
    pending.current = true;
    setBusy(true); setError(''); setFailedInput(null); setMessage('');
    try {
      const result = await chatbotService.enviar(conversation.id_conversa, data);
      if (mounted.current && epoch === sessionEpoch.current) setConversation(result);
    } catch (cause) {
      if (mounted.current && epoch === sessionEpoch.current) {
        setError(getErrorMessage(cause)); setFailedInput(data);
        await refresh().catch(() => undefined);
      }
    } finally {
      if (epoch === sessionEpoch.current) pending.current = false;
      if (mounted.current && epoch === sessionEpoch.current) setBusy(false);
    }
  }

  function select(option: ChatbotOption) {
    const selection = option.tipo === 'servico' ? { id_servico: option.id! }
      : option.tipo === 'endereco' ? { id_endereco: option.id! } : { id_combo_base: option.id };
    void send({ id_requisicao: requestId(), mensagem: option.label, selecao: selection });
  }

  // APRESENTACAO | PESSOA 3 | ETAPA 6 — O clique chama a API; a revalidação ocorre no backend.
  async function proposalAction(confirm: boolean) {
    if (!conversation?.proposta || pending.current) return;
    const epoch = sessionEpoch.current;
    pending.current = true; setBusy(true); setError(''); setFailedInput(null);
    try {
      const id = conversation.proposta.id_proposta;
      const result = confirm ? (await chatbotService.confirmar(id)).conversa : await chatbotService.cancelar(id);
      if (mounted.current && epoch === sessionEpoch.current) setConversation(result);
    } catch (cause) {
      if (mounted.current && epoch === sessionEpoch.current) { setError(getErrorMessage(cause)); await refresh().catch(() => undefined); }
    } finally { if (epoch === sessionEpoch.current) pending.current = false; if (mounted.current && epoch === sessionEpoch.current) setBusy(false); }
  }

  async function start(nova = false) {
    if (pending.current) return;
    const epoch = sessionEpoch.current;
    pending.current = true; setLoading(true); setError(''); setFailedInput(null); setHistoryOpen(false); setHistoryError('');
    try { const result = await chatbotService.iniciar(nova); if (mounted.current && epoch === sessionEpoch.current) { setConversation(result); setMessage(''); setHistoryOpen(false); setHistoryError(''); } }
    catch (cause) { if (mounted.current && epoch === sessionEpoch.current) setError(getErrorMessage(cause)); }
    finally { if (epoch === sessionEpoch.current) pending.current = false; if (mounted.current && epoch === sessionEpoch.current) setLoading(false); }
  }

  // APOIO | DEMONSTRACAO — Consultar um chat anterior não renova nem confirma sua proposta.
  async function openConversation(id: string) {
    if (pending.current) return;
    const epoch = sessionEpoch.current;
    pending.current = true; setBusy(true); setOpeningConversation(id); setHistoryError('');
    try {
      const result = await chatbotService.buscar(id);
      if (mounted.current && epoch === sessionEpoch.current) {
        setConversation(result); setMessage(''); setError(''); setFailedInput(null); setImageError(null);
        setHistoryOpen(false); setNow(Date.now());
      }
    } catch (cause) {
      if (mounted.current && epoch === sessionEpoch.current) setHistoryError(getErrorMessage(cause));
    } finally {
      if (epoch === sessionEpoch.current) pending.current = false;
      if (mounted.current && epoch === sessionEpoch.current) { setBusy(false); setOpeningConversation(null); }
    }
  }

  const proposal = conversation?.proposta;
  const summary = proposal?.resumo;
  const available = proposal?.status === 'Pendente' && new Date(proposal.expira_em).getTime() > now;
  const date = summary ? new Date(`${summary.data}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
  const timeline = splitMessagesAtProposal(conversation?.mensagens || [], proposal);

  const renderMessage = (item: ChatbotConversation['mensagens'][number]) => <View key={item.id_mensagem} style={[styles.bubble, item.papel === 'user' && styles.own]}>
    <Text selectable style={styles.message}>{item.conteudo}</Text>
    {item.fontes?.length ? <Text style={styles.sources}>Fontes: {[...new Set(item.fontes.map((source) => source.titulo))].join(' • ')}</Text> : null}
  </View>;

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <HeaderMenu navigation={navigation} profile="cliente" accentColor="#18C7C8" />
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.historyButton, (busy || loading || !isClient) && styles.disabled]} disabled={busy || loading || !isClient} onPress={() => { setHistoryError(''); setHistoryOpen((value) => !value); }} accessibilityLabel="Consultar conversas anteriores" accessibilityState={{ expanded: historyOpen }}><Ionicons name="time-outline" size={21} color="#087F83" /><Text style={styles.optionText}>Conversas</Text></TouchableOpacity>
            <TouchableOpacity style={styles.reset} disabled={busy || loading} onPress={() => start(true)} accessibilityLabel="Iniciar nova conversa"><Ionicons name="add" size={23} color="#18C7C8" /></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.title}>Assistente Diária Certa</Text>
        <Text style={styles.subtitle}>Encontre uma profissional e revise sua solicitação.</Text>
      </View>
      <View style={styles.body}>
        {historyOpen && isClient ? <ChatbotHistoryPanel key={user?.id_usuario} activeId={conversation?.id_conversa} openingId={openingConversation} error={historyError} onSelect={openConversation} onClose={() => setHistoryOpen(false)} /> : <>
        <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {!isClient ? <Text style={styles.helper}>Ative seu perfil de cliente para conversar com o assistente.</Text> : null}
          {loading ? <ActivityIndicator color="#18C7C8" /> : null}
          {timeline.before.map(renderMessage)}
          {proposal && summary ? <View style={styles.proposal}>
            <Text style={styles.proposalHeading}>Sua proposta de diária</Text>
            <View style={styles.professional}>
              <View style={styles.avatar}>
                {summary.diarista.foto_perfil && imageError !== summary.diarista.foto_perfil ? <Image source={{ uri: summary.diarista.foto_perfil }} style={styles.image} resizeMode="cover" onError={() => setImageError(summary.diarista.foto_perfil!)} /> : <Ionicons name="person" size={35} color="#FFFFFF" />}
              </View>
              <View style={styles.professionalInfo}><Text style={styles.name}>{summary.diarista.nome}</Text><Text style={styles.helper}>{summary.distancia_km.toLocaleString('pt-BR')} km de distância aproximada</Text></View>
            </View>
            <View><Text style={styles.label}>Data e início</Text><Text style={styles.detail}>{date} às {summary.horario_inicio}</Text><Text style={styles.helper}>O horário de início não define a duração total da faxina.</Text></View>
            <View><Text style={styles.label}>Endereço</Text><Text style={styles.detail}>{summary.endereco}</Text><Text style={styles.detail}>{summary.qtd_comodos} cômodos • Casa {summary.tamanho_casa === 'media' ? 'média' : summary.tamanho_casa}</Text></View>
            <View><Text style={styles.label}>{summary.combo ? `Combo: ${summary.combo}` : 'Serviços individuais'}</Text>{summary.servicos.map((item) => <Text key={item.id_diarista_servico} style={styles.detail}>• {item.nome}{!summary.combo ? ` — ${currency(item.preco)}` : ''}</Text>)}</View>
            <View style={styles.total}><Text style={styles.label}>Valor estimado</Text><Text style={styles.price}>{currency(summary.valor_estimado)}</Text></View>
            {available ? <View style={styles.actions}>
              <Text style={styles.helper}>A proposta vale por 10 minutos. A solicitação ainda dependerá do aceite da diarista.</Text>
              <TouchableOpacity style={[styles.primary, (busy || Boolean(failedInput)) && styles.disabled]} disabled={busy || Boolean(failedInput)} onPress={() => proposalAction(true)}><Text style={styles.primaryText}>Confirmar solicitação</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.secondary, busy && styles.disabled]} disabled={busy} onPress={() => proposalAction(false)}><Text style={styles.secondaryText}>Cancelar proposta</Text></TouchableOpacity>
            </View> : <Text style={styles.status}>{proposal.status === 'Confirmada' ? `Solicitação #${proposal.id_agendamento} enviada. Aguarde o aceite da diarista.` : proposal.status === 'Cancelada' ? 'Proposta cancelada.' : 'Proposta encerrada. Peça uma nova busca para atualizar os dados.'}</Text>}
            {proposal.status === 'Confirmada' ? <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('AcompanharDiarias')}><Text style={styles.primaryText}>Acompanhar solicitação</Text></TouchableOpacity> : null}
          </View> : null}
          {timeline.after.map(renderMessage)}
          {conversation?.opcoes.length ? <View style={styles.options}>{conversation.opcoes.map((option) => <TouchableOpacity key={`${option.tipo}-${option.id}`} style={[styles.option, busy && styles.disabled]} onPress={() => select(option)} disabled={busy}><Text style={styles.optionText}>{option.label}</Text></TouchableOpacity>)}</View> : null}
          {busy ? <View style={styles.busy}><ActivityIndicator color="#18C7C8" /><Text style={styles.helper}>Consultando seu pedido…</Text></View> : null}
          {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text>
            {failedInput ? <TouchableOpacity disabled={busy} onPress={() => send(failedInput)}><Text style={styles.secondaryText}>Tentar enviar novamente</Text></TouchableOpacity> : !conversation && isClient ? <TouchableOpacity onPress={() => start()}><Text style={styles.secondaryText}>Tentar novamente</Text></TouchableOpacity> : null}
            <TouchableOpacity onPress={() => navigation.navigate('EncontrarDiarista')}><Text style={styles.optionText}>Buscar diaristas manualmente</Text></TouchableOpacity>
          </View> : null}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput style={styles.input} value={message} onChangeText={setMessage} multiline maxLength={2000} placeholder="Ex.: amanhã às 9h, para limpar janelas" editable={!busy && !loading && isClient} accessibilityLabel="Mensagem para o assistente" />
          <TouchableOpacity style={[styles.send, (!message.trim() || busy || loading || !conversation) && styles.disabled]} disabled={!message.trim() || busy || loading || !conversation || !isClient} onPress={() => send()} accessibilityLabel="Enviar mensagem"><Ionicons name="send" size={21} color="#FFFFFF" /></TouchableOpacity>
        </View>
        </>}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
