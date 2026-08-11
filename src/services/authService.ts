import { request } from './api';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse, Usuario } from './types';

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const session = await request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data: { email, senha },
    });
    await tokenStorage.set(session.token);
    return session;
  },

  me() {
    return request<Usuario>({ method: 'GET', url: '/api/auth/me' });
  },

  async restore(): Promise<Usuario | null> {
    if (!(await tokenStorage.get())) return null;
    try {
      return await this.me();
    } catch {
      await tokenStorage.clear();
      return null;
    }
  },

  logout() {
    return tokenStorage.clear();
  },
};
