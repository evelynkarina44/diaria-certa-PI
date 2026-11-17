import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { avaliacaoService, type AvaliacoesRecebidas } from '../../services/avaliacaoService';
import { getErrorMessage } from '../../services/api';
import { watchAvailability } from '../../utils/watchAvailability';

export function ReceivedReviews({ navigation, compact = false }: { navigation: any; compact?: boolean }) {
  const { user } = useAuth();
  return <Reviews key={user?.id_usuario + ':' + user?.activeProfile} navigation={navigation} compact={compact}
    worker={user?.activeProfile === 'DIARISTA'} />;
}

function Reviews({ navigation, compact, worker }: { navigation: any; compact: boolean; worker: boolean }) {
  const [data, setData] = useState<AvaliacoesRecebidas | null>(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(compact);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const accent = worker ? '#C2410C' : '#008A99';
  useEffect(() => {
    let active = true;
    setBusy(true);setError('');setData(null);
    const stop = watchAvailability(navigation, async () => {
      try {
        const result = await avaliacaoService.recebidas(page, compact ? 3 : 5);
        if (active) {
          if (page > Math.max(1, result.pagination.pages)) { setPage(Math.max(1, result.pagination.pages));return; }
          setData(result);setError('');
        }
      } catch (cause) { if (active) setError(getErrorMessage(cause)); }
      finally { if (active) setBusy(false); }
    });
    return () => { active = false;stop(); };
  }, [navigation, page, compact, worker]);

  return <View style={styles.panel}>
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }}
      accessibilityLabel={expanded ? 'Recolher avaliações recebidas' : 'Ver avaliações recebidas'}
      onPress={() => setExpanded(value => !value)} style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>{compact ? 'O que as diaristas dizem sobre você' : 'Avaliações recebidas'}</Text>
        {data && <Text style={styles.summary}>{data.media === null ? 'Sem avaliações' : data.media.toFixed(1) + ' de 5'} · {data.pagination.total} {data.pagination.total === 1 ? 'avaliação' : 'avaliações'}</Text>}
      </View>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={accent} />
    </TouchableOpacity>
    {expanded && <>
      {busy && <ActivityIndicator color={accent} />}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {data?.data.map(review => <View key={review.id_avaliacao} style={styles.card}>
        <View style={styles.row}><Text style={styles.author}>{review.autor}</Text>
          <Text style={styles.date}>{new Date(review.data_avaliacao).toLocaleDateString('pt-BR')}</Text></View>
        <Text accessibilityLabel={review.nota + ' de 5 estrelas'} style={styles.stars}>{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.nota))))}{'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(review.nota))))} <Text style={styles.summary}>{review.nota.toFixed(1)}</Text></Text>
        <Text style={styles.comment}>{review.comentario?.trim() || 'Avaliação sem comentário.'}</Text>
      </View>)}
      {data && !data.pagination.total && <Text style={styles.comment}>As avaliações que você receber após as diárias aparecerão aqui.</Text>}
      {data && data.pagination.pages > 1 && <View style={styles.pagination}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Avaliações anteriores" disabled={busy || page <= 1} onPress={() => setPage(value => value - 1)}
          style={[styles.pageButton, (busy || page <= 1) && styles.disabled]}><Ionicons name="chevron-back" size={20} color={accent} /></TouchableOpacity>
        <Text style={styles.summary}>{page} de {data.pagination.pages}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próximas avaliações" disabled={busy || page >= data.pagination.pages} onPress={() => setPage(value => value + 1)}
          style={[styles.pageButton, (busy || page >= data.pagination.pages) && styles.disabled]}><Ionicons name="chevron-forward" size={20} color={accent} /></TouchableOpacity>
      </View>}
    </>}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', marginVertical: 16, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 16, padding: 16, backgroundColor: '#FFFFFF', gap: 12 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 44 },
  heading: { fontSize: 16, fontWeight: '600', color: '#1D2939' },
  summary: { fontSize: 12, lineHeight: 20, color: '#667085' },
  card: { borderTopWidth: 1, borderTopColor: '#EAECF0', paddingTop: 12, gap: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  author: { fontSize: 14, fontWeight: '600', color: '#1D2939', flexShrink: 1 },
  date: { fontSize: 11, color: '#667085' },
  stars: { color: '#EAA400', fontSize: 19 },
  comment: { fontSize: 14, lineHeight: 22, color: '#475467' },
  error: { fontSize: 13, color: '#B42318' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F2F4F7' },
  disabled: { opacity: 0.3 },
});
