import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from './GlobalContext';
import { ApiError } from '../services/api';
import { notificationService, type AppNotification } from '../services/notificationService';

type NotificationContextValue = {
  items: AppNotification[]; unread: number; total: number; hasMore: boolean;
  loading: boolean; refreshing: boolean; stale: boolean; sessionExpired: boolean;
  refresh: () => Promise<void>; loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>; markAll: () => Promise<void>;
};
const noop = async () => {};
const NotificationContext = createContext<NotificationContextValue>({
  items: [], unread: 0, total: 0, hasMore: false, loading: false, refreshing: false,
  stale: false, sessionExpired: false, refresh: noop, loadMore: noop, markRead: noop, markAll: noop,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = user && user.activeProfile ? user.id_usuario + ':' + user.activeProfile : '';
  const owner = useRef(key); owner.current = key;
  const [dataOwner, setDataOwner] = useState('');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const page = useRef(1);
  const version = useRef(0);
  const invalid = useRef(false);
  const writing = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const reload = useRef<(more?: boolean) => Promise<void>>(noop);

  useEffect(() => {
    let active = true;
    version.current++; page.current = 1; invalid.current = false; writing.current = false; inFlight.current = null;
    setItems([]); setUnread(0); setTotal(0); setPages(0); setStale(false); setSessionExpired(false); setDataOwner(key);
    setLoading(Boolean(key)); setRefreshing(false);
    async function load(more = false) {
      if (!active || !key || invalid.current) return;
      if (inFlight.current) return inFlight.current;
      const operation = ++version.current;
      setRefreshing(true);
      const run = (async () => {
        try {
          const first = more ? page.current + 1 : 1, last = more ? first : page.current;
          const responses = [];
          for (let current = first; current <= last; current++) responses.push(await notificationService.listar(current));
          if (!active || owner.current !== key || operation !== version.current) return;
          const incoming = responses.flatMap(response => response.data);
          setItems(previous => more ? [...previous.filter(item => !incoming.some(next => next.id === item.id)), ...incoming] : incoming);
          const result = responses[responses.length - 1];
          setUnread(result.nao_lidas); setTotal(result.pagination.total); setPages(result.pagination.pages); setStale(false);
          page.current = more ? first : Math.min(page.current, Math.max(1, result.pagination.pages));
        } catch (cause) {
          if (active && owner.current === key && operation === version.current) {
            setStale(true);
            if (cause instanceof ApiError && cause.status === 401) { invalid.current = true; setSessionExpired(true); setItems([]); setUnread(0); setTotal(0); }
          }
          throw cause;
        } finally {
          if (active && owner.current === key && operation === version.current) { setLoading(false); setRefreshing(false); }
        }
      })();
      inFlight.current = run;
      try { await run; } finally { if (inFlight.current === run) inFlight.current = null; }
    }
    reload.current = more => load(more);
    void load().catch(() => {});
    const refresh = () => {
      if (key && !writing.current && AppState.currentState === 'active'
        && (Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden)) void load().catch(() => {});
    };
    const app = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    const timer = setInterval(refresh, 15000);
    if (Platform.OS === 'web') { window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh); }
    return () => {
      active = false; version.current++; inFlight.current = null;
      clearInterval(timer); app.remove();
      if (Platform.OS === 'web') { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); }
    };
  }, [key]);

  async function markRead(id: string) {
    if (!key || writing.current || invalid.current) throw new Error('Aguarde a atualização ou entre novamente.');
    const operationOwner = key;
    writing.current = true; version.current++; inFlight.current = null;
    try {
      await notificationService.ler(id);
      if (owner.current !== operationOwner) return;
      const wasUnread = items.some(item => item.id === id && !item.lida);
      setItems(previous => previous.map(item => item.id === id ? { ...item, lida: true } : item));
      if (wasUnread) setUnread(previous => Math.max(0, previous - 1));
      await reload.current().catch(() => {});
    } finally { if (owner.current === operationOwner) { writing.current = false; setRefreshing(false); } }
  }
  async function markAll() {
    if (!key || writing.current || invalid.current) throw new Error('Aguarde a atualização ou entre novamente.');
    const operationOwner = key;
    writing.current = true; version.current++; inFlight.current = null;
    try {
      await notificationService.lerTodas();
      if (owner.current !== operationOwner) return;
      setItems(previous => previous.map(item => ({ ...item, lida: true }))); setUnread(0);
      await reload.current().catch(() => {});
    } finally { if (owner.current === operationOwner) { writing.current = false; setRefreshing(false); } }
  }
  const sameOwner = dataOwner === key;
  return <NotificationContext.Provider value={{
    items: sameOwner ? items : [], unread: sameOwner ? unread : 0, total: sameOwner ? total : 0,
    hasMore: sameOwner && page.current < pages, loading: sameOwner && loading, refreshing: sameOwner && refreshing,
    stale: sameOwner && stale, sessionExpired: sameOwner && sessionExpired,
    refresh: () => reload.current(), loadMore: () => reload.current(true), markRead, markAll,
  }}>{children}</NotificationContext.Provider>;
}
export const useNotifications = () => useContext(NotificationContext);
