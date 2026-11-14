import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/GlobalContext';
import { ApiError, getErrorMessage } from '../../services/api';
import type { AppNotification } from '../../services/notificationService';
import { ActionModal } from '../action-modal';

export function NotificationBell({ navigation, accentColor = '#18C7C8' }: { navigation: any; accentColor?: string }) {
  const notification = useNotifications();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const operation = React.useRef(false);
  const sessionKey = user?.id_usuario + ':' + user?.activeProfile;
  const currentSession = React.useRef(sessionKey); currentSession.current = sessionKey;
  useEffect(() => { setVisible(false); setError(''); setBusy(false); setExpired(false); operation.current = false; }, [sessionKey]);
  function showError(cause: unknown) {
    if (!navigation.isFocused()) return;
    setExpired(notification.sessionExpired || (cause instanceof ApiError && cause.status === 401));
    setError(getErrorMessage(cause));
  }
  async function open() {
    const scope = currentSession.current;
    setVisible(true);
    if (notification.sessionExpired) { setExpired(true); setError('Sua sessão expirou. Entre novamente.'); return; }
    try { await notification.refresh(); } catch (cause) { if (scope === currentSession.current) showError(cause); }
  }
  async function read(item: AppNotification) {
    if (operation.current) return;
    operation.current = true; setBusy(true);
    const session = currentSession.current;
    try {
      if (!item.lida) await notification.markRead(item.id);
      if (session !== currentSession.current || !navigation.isFocused()) return;
      setVisible(false);
      const route = item.acao === 'checkin' ? 'CheckIn' : item.acao === 'avaliacao' ? 'Avaliacao' : item.acao === 'pagamento' ? 'Pagamento' : item.acao === 'diaria' ? 'CheckInDiarista' : 'AcompanharDiarias';
      navigation.navigate(route, { agendamentoId: item.id_agendamento });
    } catch (cause) { if (session === currentSession.current) showError(cause); }
    finally { if (session === currentSession.current) { operation.current = false; setBusy(false); } }
  }
  async function readAll() {
    if (operation.current) return;
    operation.current = true; setBusy(true);
    const scope = currentSession.current;
    try { await notification.markAll(); } catch (cause) { if (scope === currentSession.current) showError(cause); }
    finally { if (scope === currentSession.current) { operation.current = false; setBusy(false); } }
  }
  async function refreshList(more = false) {
    const scope = currentSession.current;
    try { if (more) await notification.loadMore(); else await notification.refresh(); }
    catch (cause) { if (scope === currentSession.current) showError(cause); }
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={'Notificações, ' + notification.unread + ' não lidas'}
      style={styles.trigger} onPress={() => void open()}>
      <Ionicons name="notifications-outline" size={24} color={accentColor} />
      {notification.unread > 0 && <View style={styles.counter}><Text style={styles.counterText}>{notification.unread > 99 ? '99+' : notification.unread}</Text></View>}
    </Pressable>
    <Modal visible={visible && !error} transparent animationType="fade" onRequestClose={() => { if (!busy) setVisible(false); }}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fechar notificações" disabled={busy} onPress={() => setVisible(false)} />
        <View style={styles.panel} accessibilityViewIsModal>
          <View style={styles.header}><Text style={styles.title}>Notificações</Text><Pressable accessibilityLabel="Fechar" disabled={busy} onPress={() => setVisible(false)}><Ionicons name="close" size={24} color="#344054" /></Pressable></View>
          <Text style={styles.subtitle}>Novidades sobre suas diárias nos últimos 30 dias.</Text>
          <View style={styles.tools}>
            <Pressable accessibilityRole="button" accessibilityLabel="Atualizar notificações" accessibilityState={{ disabled: notification.refreshing || busy, busy: notification.refreshing }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', backgroundColor: accentColor + '14' }} disabled={notification.refreshing || busy} onPress={() => void refreshList()}>{notification.refreshing ? <ActivityIndicator size="small" color={accentColor} /> : <Ionicons name="refresh-outline" size={22} color={accentColor} />}</Pressable>
            <Pressable disabled={busy || notification.unread === 0} onPress={() => void readAll()}><Text style={[styles.link, { color: notification.unread ? accentColor : '#98A2B3' }]}>Marcar todas como lidas</Text></Pressable>
          </View>
          {(notification.loading || notification.refreshing || busy) && <ActivityIndicator color={accentColor} />}
          {notification.stale && <Text style={styles.subtitle}>Atualização pendente. Toque no ícone de atualização para tentar novamente.</Text>}
          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 12 }}>
            {!notification.loading && !notification.items.length && <View style={styles.empty}><Ionicons name="notifications-off-outline" size={36} color="#98A2B3" /><Text style={styles.subtitle}>Nenhuma novidade por enquanto.</Text></View>}
            {notification.items.map(item => <Pressable key={item.id} disabled={busy} onPress={() => void read(item)}
              style={[styles.item, !item.lida && { backgroundColor: accentColor + '0D' }]}>
              <View style={styles.itemHeader}><Text style={styles.itemTitle}>{item.titulo}</Text>{!item.lida && <View style={[styles.dot, { backgroundColor: accentColor }]} />}</View>
              <Text style={styles.message}>{item.mensagem}</Text>
              <Text style={styles.date}>{new Date(item.criado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</Text>
              <Text style={[styles.link, { color: accentColor, marginTop: 7 }]}>Abrir diária #{item.id_agendamento}</Text>
            </Pressable>)}
            {notification.hasMore && <Pressable disabled={notification.refreshing || busy} style={styles.more} onPress={() => void refreshList(true)}><Text style={[styles.link, { color: accentColor }]}>Carregar mais notificações</Text></Pressable>}
          </ScrollView>
        </View>
      </View>
    </Modal>
    <ActionModal visible={Boolean(error)} variant="error" title={expired ? 'Sessão expirada' : 'Não foi possível atualizar'} message={error}
      confirmLabel={expired ? 'Entrar novamente' : 'Entendi'} onClose={() => setError('')}
      onConfirm={() => { setError(''); if (expired) { setVisible(false); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } }} />
  </>;
}
const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', top: -5, right: -6, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, backgroundColor: '#D92D20', alignItems: 'center', justifyContent: 'center' },
  counterText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', padding: 18, justifyContent: 'center', alignItems: 'center' },
  panel: { width: '100%', maxWidth: 540, maxHeight: '85%', borderRadius: 20, backgroundColor: '#FFFFFF', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 21, color: '#222222' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#667085', marginTop: 10, lineHeight: 18 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginVertical: 18 },
  link: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  list: { flexShrink: 1 },
  item: { borderWidth: 1, borderColor: '#EAECF0', borderRadius: 13, padding: 14, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemTitle: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#344054' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  message: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#667085', lineHeight: 18, marginTop: 7 },
  date: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#98A2B3', marginTop: 7 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  more: { padding: 14, alignItems: 'center' },
});
