import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import type { Usuario } from '../services/types';

type GlobalContextValue = {
  user: Usuario | null;
  initializing: boolean;
  login(email: string, password: string): Promise<Usuario>;
  logout(): Promise<void>;
  refreshSession(): Promise<Usuario | null>;
};

const defaultValue: GlobalContextValue = {
  user: null,
  initializing: true,
  login: async () => {
    throw new Error('GlobalProvider não inicializado');
  },
  logout: async () => undefined,
  refreshSession: async () => null,
};

export const GlobalContext =
  createContext<GlobalContextValue>(defaultValue);

type GlobalProviderProps = {
  children: ReactNode;
};

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [initializing, setInitializing] = useState(true);

  async function refreshSession() {
    const restoredUser = await authService.restore();
    setUser(restoredUser);
    return restoredUser;
  }

  useEffect(() => {
    let mounted = true;
    authService
      .restore()
      .then((restoredUser) => {
        if (mounted) setUser(restoredUser);
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const session = await authService.login(email, password);
    setUser(session.user);
    return session.user;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, initializing, login, logout, refreshSession }),
    [user, initializing],
  );

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useAuth() {
  return useContext(GlobalContext);
}
