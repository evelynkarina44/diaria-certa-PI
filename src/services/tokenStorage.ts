import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'diaria_certa_access_token';
let webToken: string | null = null;

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') return webToken;
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = token;
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      webToken = null;
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
