import { AppState, Platform } from 'react-native';

// Atualização somente enquanto esta tela está em foco e o aplicativo está ativo.
// Também funciona entre dispositivos: não depende de eventos locais de salvamento.
export function watchAvailability(navigation: any, refresh: () => Promise<void>) {
  let disposed = false;
  let running = false;
  async function update() {
    if (disposed || running || navigation.isFocused?.() === false ||
        (AppState.currentState && AppState.currentState !== 'active')) return;
    running = true;
    try { await refresh(); } finally { running = false; }
  }
  const onFocus = () => { void update(); };
  const unsubscribe = navigation.addListener('focus', onFocus);
  const appSubscription = AppState.addEventListener('change', state => {
    if (state === 'active') onFocus();
  });
  const interval = setInterval(onFocus, 30_000);
  const browser = Platform.OS === 'web' && typeof window !== 'undefined' ? window : null;
  const onVisible = () => { if (typeof document === 'undefined' || document.visibilityState === 'visible') onFocus(); };
  browser?.addEventListener('focus', onFocus);
  browser?.document.addEventListener('visibilitychange', onVisible);
  onFocus();
  return () => {
    disposed = true;
    unsubscribe();
    appSubscription.remove();
    clearInterval(interval);
    browser?.removeEventListener('focus', onFocus);
    browser?.document.removeEventListener('visibilitychange', onVisible);
  };
}
