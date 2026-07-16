'use client';

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/utils/constants';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    set({ user: null, token: null, isLoading: false });
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  initialize: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
