import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'diaria_certa_access_token';
let webToken: string | null = null;

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Sobrevive a reload/Fast Refresh, sem compartilhar login entre abas.
      try {
        if (typeof window !== 'undefined') return window.sessionStorage.getItem(TOKEN_KEY);
      } catch { /* Navegador pode bloquear armazenamento; mantém fallback em memória. */ }
      return webToken;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = token;
      try {
        if (typeof window !== 'undefined') window.sessionStorage.setItem(TOKEN_KEY, token);
      } catch { /* Fallback em memória para navegadores com armazenamento bloqueado. */ }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = null;
      try {
        if (typeof window !== 'undefined') window.sessionStorage.removeItem(TOKEN_KEY);
      } catch { /* O fallback em memória já foi removido. */ }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
