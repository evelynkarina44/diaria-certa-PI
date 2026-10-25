import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatbotService, type ChatbotConversationSummary } from '../../services/chatbotService';
import { getErrorMessage } from '../../services/api';
import { styles } from './styles';

type Props = {
  activeId?: string;
  openingId: string | null;
  error: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

const formatDate = (value: string) => new Date(value).toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function ChatbotHistoryPanel({ activeId, openingId, error, onSelect, onClose }: Props) {
  const [items, setItems] = useState<ChatbotConversationSummary[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const mounted = useRef(false);
  const pending = useRef(false);

  async function load(nextPage: number) {
    if (pending.current) return;
    pending.current = true;
    setLoading(true); setLoadError('');
    try {
      const result = await chatbotService.listar(nextPage);
      if (!mounted.current) return;
      setItems((previous) => nextPage === 1 ? result.data : [...new Map([...previous, ...result.data].map((item) => [item.id_conversa, item])).values()]);
      setPage(result.pagination.page); setPages(result.pagination.pages);
    } catch (cause) {
      if (mounted.current) setLoadError(getErrorMessage(cause));
    } finally {
      pending.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    void load(1);
    return () => { mounted.current = false; };
  }, []);

  return <View style={styles.historyPanel}>
    <View style={styles.historyHeading}>
      <View style={styles.professionalInfo}>
        <Text style={styles.historyTitle}>Conversas anteriores</Text>
        <Text style={styles.helper}>Selecione um chat para consultar ou continuar.</Text>
      </View>
      <TouchableOpacity style={styles.reset} disabled={Boolean(openingId)} onPress={onClose} accessibilityLabel="Voltar à conversa"><Ionicons name="close" size={23} color="#087F83" /></TouchableOpacity>
    </View>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.historyContent} keyboardShouldPersistTaps="handled">
      {items.map((item) => {
        const active = item.id_conversa === activeId;
        return <TouchableOpacity key={item.id_conversa} style={[styles.historyItem, active && styles.historyItemActive, Boolean(openingId) && styles.disabled]} disabled={Boolean(openingId)} onPress={() => onSelect(item.id_conversa)} accessibilityLabel={`Abrir conversa: ${item.titulo}`} accessibilityState={{ selected: active, busy: openingId === item.id_conversa }}>
          <View style={styles.historyItemIcon}><Ionicons name="chatbubbles-outline" size={21} color="#087F83" /></View>
          <View style={styles.professionalInfo}>
            <Text style={styles.name} numberOfLines={2}>{item.titulo}</Text>
            <Text style={styles.helper}>{formatDate(item.atualizado_em)}</Text>
            <Text style={styles.sources}>{item.total_mensagens} {item.total_mensagens === 1 ? 'mensagem' : 'mensagens'}{active ? ' • Conversa atual' : ''}</Text>
          </View>
          {openingId === item.id_conversa ? <ActivityIndicator color="#18C7C8" /> : <Ionicons name="chevron-forward" size={20} color="#18C7C8" />}
        </TouchableOpacity>;
      })}
      {loading ? <View style={styles.historyEmpty}><ActivityIndicator color="#18C7C8" /><Text style={styles.helper}>Carregando conversas…</Text></View> : null}
      {!loading && !loadError && !items.length ? <View style={styles.historyEmpty}><Ionicons name="chatbubbles-outline" size={38} color="#AADFDF" /><Text style={styles.name}>Nenhuma conversa encontrada</Text><Text style={styles.helper}>Seus chats com o assistente aparecerão aqui.</Text></View> : null}
      {error || loadError ? <View style={styles.error}>
        <Text style={styles.errorText} accessibilityRole="alert">{error || loadError}</Text>
        {loadError ? <TouchableOpacity disabled={loading || Boolean(openingId)} onPress={() => load(page ? page + 1 : 1)}><Text style={styles.secondaryText}>Tentar carregar novamente</Text></TouchableOpacity> : null}
      </View> : null}
      {!loadError && page < pages && !loading ? <TouchableOpacity style={styles.historyMore} disabled={Boolean(openingId)} onPress={() => load(page + 1)}><Text style={styles.optionText}>Carregar mais conversas</Text></TouchableOpacity> : null}
    </ScrollView>
  </View>;
}
