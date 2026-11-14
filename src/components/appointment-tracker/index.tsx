import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { ApiError, getErrorMessage } from '../../services/api';
import { trackingService, type TrackingAppointment, type TrackingProfile } from '../../services/trackingService';
import { trackingState } from '../../utils/appointmentTracking';
import { agendamentoService } from '../../services/agendamentoService';
import { ActionModal } from '../action-modal';

type Props = { navigation: any; profile: TrackingProfile; compact?: boolean; showTitle?: boolean; showSubtitle?: boolean };
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateLabel = (value: string) => new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const timeLabel = (value: string | null) => value?.includes('T') ? value.slice(11, 16) : value?.slice(0, 5) ?? '';
const stamp = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export function AppointmentTracker(props: Props) {
  const { user } = useAuth();
  if (!user || user.activeProfile !== props.profile) return null;
  return <Tracker key={user.id_usuario + ':' + props.profile} {...props} />;
}

function Tracker({ navigation, profile, compact = false, showTitle = true, showSubtitle = true }: Props) {
  const [items, setItems] = useState<TrackingAppointment[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<'all' | 'action' | 'finished'>('all');
  const [brokenPhotos, setBrokenPhotos] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; title: string; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{ item: TrackingAppointment; accept: boolean } | null>(null);
  const [responding, setResponding] = useState(false);
  const fetching = useRef(false);
  const writing = useRef(false);
  const request = useRef(0);
  const alive = useRef(true);
  const invalidSession = useRef(false);
  const loadedPages = useRef(1);
  const reload = useRef<(more?: boolean) => Promise<void>>(async () => {});
  const accent = profile === 'CLIENTE' ? '#18C7C8' : '#FF6B2C';

  useEffect(() => {
    let active = true;
    alive.current = true;
    async function load(more = false, silent = false) {
      if (!active || fetching.current || invalidSession.current) return;
      fetching.current = true; setRefreshing(true);
      const version = ++request.current;
      const nextPage = more ? loadedPages.current + 1 : 1;
      try {
        const responses = [];
        const lastPage = more ? nextPage : loadedPages.current;
        for (let page = nextPage; page <= lastPage; page++) responses.push(await trackingService.listar(page));
        if (!active || version !== request.current) return;
        const incoming = responses.flatMap(response => response.data);
        setItems(current => more ? [...current.filter(item => !incoming.some(next => next.id_agendamento === item.id_agendamento)), ...incoming] : incoming);
        const response = responses[responses.length - 1];
        setTotal(response.pagination.total); setPages(response.pagination.pages);
        setStale(false);
        loadedPages.current = more ? nextPage : Math.min(loadedPages.current, Math.max(1, response.pagination.pages));
      } catch (cause) {
        if (!active || version !== request.current) return;
        setStale(true);
        if (cause instanceof ApiError && cause.status === 401) {
          invalidSession.current = true;
          setFeedback({ kind: 'error', title: 'Sessão expirada', message: 'Entre novamente para acompanhar suas diárias.' });
        } else if (!silent) setFeedback({ kind: 'error', title: 'Não foi possível atualizar', message: getErrorMessage(cause) });
      } finally {
        if (active && version === request.current) { fetching.current = false; setRefreshing(false); setLoading(false); }
      }
    }
    reload.current = more => load(more);
    void load();
    const visible = () => navigation.isFocused() && AppState.currentState === 'active'
      && (Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden);
    const refresh = () => { if (visible() && !writing.current) { setNow(Date.now()); void load(false, true); } };
    const unsubscribe = navigation.addListener('focus', () => { setNow(Date.now()); void load(false, true); });
    const app = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    const timer = setInterval(refresh, 15000);
    if (Platform.OS === 'web') { window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh); }
    return () => {
      active = false; alive.current = false; request.current++; fetching.current = false;
      clearInterval(timer); unsubscribe(); app.remove();
      if (Platform.OS === 'web') { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); }
    };
  }, [navigation, profile]);

  async function respond() {
    if (!confirm || writing.current) return;
    const selected = confirm;
    writing.current = true; request.current++; fetching.current = false; setResponding(true);
    try {
      if (selected.accept) await agendamentoService.aceitar(selected.item.id_agendamento);
      else await agendamentoService.recusar(selected.item.id_agendamento);
      if (!alive.current) return;
      setItems(current => current.map(item => item.id_agendamento === selected.item.id_agendamento ? { ...item, status: selected.accept ? 'Aceito' : 'Recusado' } : item));
      setConfirm(null);
      setFeedback({ kind: 'success', title: selected.accept ? 'Solicitação aceita' : 'Solicitação recusada',
        message: selected.accept ? 'O cliente já pode pagar a entrada. Acompanhe a próxima etapa neste painel.' : 'A recusa foi registrada e o cliente poderá acompanhá-la no painel dele.' });
      await reload.current();
    } catch (cause) {
      if (alive.current) { setConfirm(null); setFeedback({ kind: 'error', title: 'Não foi possível responder', message: getErrorMessage(cause) }); }
    } finally { writing.current = false; if (alive.current) { setResponding(false); setRefreshing(false); } }
  }

  const states = items.map(item => ({ item, state: trackingState(item, profile, now) }))
    .sort((a, b) => a.state.priority - b.state.priority || (a.item.inicio_em ?? a.item.data_agendamento).localeCompare(b.item.inicio_em ?? b.item.data_agendamento));
  const filtered = states.filter(({ state }) => filter === 'all' || (filter === 'action' ? state.requiresAction : state.finished));
  const shown = compact ? states.slice(0, 3) : filtered;
  const steps = ['Solicitação', 'Aceite', 'Entrada', 'Diária', 'Saldo', profile === 'CLIENTE' ? 'Avaliação' : 'Quitação'];
  function open(item: TrackingAppointment, route?: string) {
    if (route) navigation.navigate(route, { agendamentoId: item.id_agendamento });
  }

  return (
    <View style={styles.section}>
      <View style={[styles.header, !showTitle && { justifyContent: 'flex-end' }]}>
        {showTitle && <Text style={styles.title}>Minhas diárias</Text>}
        <Pressable accessibilityRole="button" accessibilityLabel="Atualizar diárias" accessibilityState={{ disabled: refreshing || responding, busy: refreshing }} style={[{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: accent + '14' }, (refreshing || responding) && styles.disabled]} onPress={() => void reload.current()} disabled={refreshing || responding}>
          {refreshing ? <ActivityIndicator color={accent} /> : <Ionicons name="refresh-outline" size={22} color={accent} />}
        </Pressable>
      </View>
      {showSubtitle && <Text style={styles.subtitle}>{compact ? 'Acompanhe o status e continue pela próxima etapa.' : 'Solicitação, pagamento e execução em um só lugar.'}</Text>}
      {!compact && <View style={styles.filters}>
        {(['all', 'action', 'finished'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }}
          style={[styles.filter, filter === value && { borderColor: accent, backgroundColor: accent + '12' }]} onPress={() => setFilter(value)}>
          <Text style={styles.filterText}>{value === 'all' ? 'Todas' : value === 'action' ? 'Sua próxima ação' : 'Encerradas'}</Text>
        </Pressable>)}
      </View>}
      {loading && <ActivityIndicator color={accent} style={{ marginVertical: 20 }} />}
      {!loading && !shown.length && <View style={styles.empty}><Ionicons name="calendar-outline" size={27} color={accent} /><Text style={styles.description}>
        {stale && !items.length ? 'Toque no ícone de atualização para carregar suas diárias.' : filter === 'action' ? 'Você não tem ações pendentes nas diárias carregadas.' : filter === 'finished' ? 'Nenhuma diária finalizada nas páginas carregadas.' : 'Nenhuma diária em acompanhamento. Suas novas solicitações aparecerão aqui.'}
      </Text></View>}
      {shown.map(({ item, state }) => <View key={item.id_agendamento} style={styles.card}>
        <View style={styles.personRow}>
          <View style={[styles.avatar, { backgroundColor: accent + '14' }]}>
            {item.pessoa?.foto_perfil && !brokenPhotos.includes(item.id_agendamento)
              ? <Image source={{ uri: item.pessoa.foto_perfil }} style={styles.photo} onError={() => setBrokenPhotos(current => [...current, item.id_agendamento])} />
              : <Ionicons name="person-outline" size={25} color={accent} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.pessoa?.nome ?? (profile === 'CLIENTE' ? 'Diarista' : 'Cliente')}</Text>
            <Text style={styles.meta}>#{item.id_agendamento} • {dateLabel(item.data_agendamento)} às {timeLabel(item.horario_inicio)}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: accent + '12' }]}><Text style={[styles.badgeText, { color: accent }]}>{state.title}</Text></View>
        {state.step >= 0 && <View style={styles.steps}>
          {steps.map((label, index) => <View key={label} style={styles.step}>
            <View style={[styles.dot, { borderColor: index <= state.step ? accent : '#D0D5DD', backgroundColor: index < state.step ? accent : '#FFFFFF' }]}>
              {index < state.step ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : <Text style={{ fontSize: 9, color: index === state.step ? accent : '#98A2B3' }}>{index + 1}</Text>}
            </View>
            <Text style={[styles.stepText, index === state.step && { color: accent }]}>{label}</Text>
          </View>)}
        </View>}
        <Text style={styles.description}>{state.description}</Text>
        {!compact && <>
          {item.servicos.length > 0 && <Text style={styles.detail}>Serviços: {item.servicos.join(' • ')}</Text>}
          {item.endereco && <Text style={styles.detail}>{item.endereco.logradouro}, {item.endereco.numero} — {item.endereco.bairro}, {item.endereco.cidade}/{item.endereco.estado}</Text>}
          {item.checkin?.horario_checkin && <Text style={styles.detail}>Check-in: {stamp(item.checkin.horario_checkin)}</Text>}
          {item.checkin?.horario_checkout && <Text style={styles.detail}>Checkout: {stamp(item.checkin.horario_checkout)}</Text>}
        </>}
        {item.pagamento && <View style={styles.payment}>
          <Text style={styles.total}>Total: {money(item.pagamento.valor_total)}</Text>
          {item.pagamento.parcelas.map(part => <Text key={part.fase} style={styles.meta}>{part.fase}: {money(part.valor)} • {part.status.replace(/_/g, ' ')}</Text>)}
        </View>}
        {state.respond ? <View style={styles.buttons}>
          <Pressable accessibilityRole="button" style={[styles.secondary, responding && styles.disabled]} disabled={responding} onPress={() => setConfirm({ item, accept: false })}><Text style={styles.secondaryText}>Recusar</Text></Pressable>
          <Pressable accessibilityRole="button" style={[styles.primary, { backgroundColor: accent }, responding && styles.disabled]} disabled={responding} onPress={() => setConfirm({ item, accept: true })}><Text style={styles.primaryText}>Aceitar</Text></Pressable>
        </View> : state.route && <Pressable accessibilityRole="button" style={[styles.primary, { backgroundColor: accent, marginTop: 16 }]} onPress={() => open(item, state.route)}><Text style={styles.primaryText}>{state.actionLabel}</Text></Pressable>}
      </View>)}
      {compact ? <Pressable accessibilityRole="button" style={styles.all} onPress={() => navigation.navigate('AcompanharDiarias')}><Text style={[styles.link, { color: accent }]}>Ver todas as diárias{total ? ' (' + total + ')' : ''}</Text><Ionicons name="chevron-forward" size={17} color={accent} /></Pressable>
        : loadedPages.current < pages && <Pressable accessibilityRole="button" style={styles.all} disabled={refreshing} onPress={() => void reload.current(true)}><Text style={[styles.link, { color: accent }]}>Carregar mais diárias</Text></Pressable>}
      <ActionModal visible={Boolean(feedback)} variant={feedback?.kind ?? 'info'} title={feedback?.title ?? ''} message={feedback?.message ?? ''}
        confirmLabel={invalidSession.current ? 'Entrar novamente' : 'Entendi'} accentColor={accent} onClose={() => setFeedback(null)}
        onConfirm={() => { setFeedback(null); if (invalidSession.current) navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} />
      <ActionModal visible={Boolean(confirm) && !feedback} variant="confirm" accentColor={accent}
        title={confirm?.accept ? 'Aceitar solicitação?' : 'Recusar solicitação?'}
        message={confirm ? 'Agendamento #' + confirm.item.id_agendamento + ' para ' + dateLabel(confirm.item.data_agendamento) + ' às ' + timeLabel(confirm.item.horario_inicio) + '. Confirma sua decisão?' : ''}
        confirmLabel={confirm?.accept ? 'Sim, aceitar' : 'Sim, recusar'} cancelLabel="Voltar" busy={responding} onConfirm={respond} onClose={() => setConfirm(null)} />
    </View>
  );
}
const styles = StyleSheet.create({
  section: { width: '100%', marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 19, color: '#222222' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#667085', marginTop: 5 },
  link: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  filter: { borderWidth: 1, borderColor: '#EAECF0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  filterText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#344054' },
  empty: { borderRadius: 14, padding: 18, backgroundColor: '#FFFFFF', marginTop: 14, gap: 10 },
  card: { borderWidth: 1, borderColor: '#EAECF0', borderRadius: 18, padding: 16, backgroundColor: '#FFFFFF', marginTop: 14 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#222222' },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#667085', marginTop: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 14 },
  badgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  steps: { flexDirection: 'row', marginTop: 18, marginBottom: 14 },
  step: { flex: 1, alignItems: 'center', gap: 5 },
  dot: { width: 22, height: 22, borderWidth: 1.5, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: 'Poppins_400Regular', fontSize: 8, color: '#667085', textAlign: 'center' },
  description: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 19, color: '#475467', marginTop: 8 },
  detail: { fontFamily: 'Poppins_400Regular', fontSize: 11, lineHeight: 18, color: '#667085', marginTop: 10 },
  payment: { borderTopWidth: 1, borderColor: '#F2F4F7', paddingTop: 12, marginTop: 14 },
  total: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#344054' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primary: { flex: 1, minHeight: 44, borderRadius: 11, padding: 12, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF', textAlign: 'center' },
  secondary: { flex: 1, minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: '#D0D5DD', padding: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#D92D20' },
  all: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
  disabled: { opacity: 0.5 },
});
