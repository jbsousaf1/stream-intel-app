// src/store/authStore.ts
import { create } from 'zustand';
import { setToken, clearToken } from '../services/api';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/authService';
import type { User } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // actions
  initialise: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,

  initialise: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getMe();
      set({ user, isLoggedIn: true });
    } catch {
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiLogin(username, password);
      await setToken(res.token);
      set({ user: res.user, isLoggedIn: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      set({ error: msg });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRegister(username, password, displayName);
      await setToken(res.token);
      set({ user: res.user, isLoggedIn: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      set({ error: msg });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } finally {
      await clearToken();
      set({ user: null, isLoggedIn: false, error: null });
    }
  },

  setUser: (user) => set({ user, isLoggedIn: user !== null }),

  clearError: () => set({ error: null }),
}));
