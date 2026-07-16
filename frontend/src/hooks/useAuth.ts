'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/utils/constants';
import type { LoginPayload, RegisterPayload } from '@/types';
import { useState, useCallback } from 'react';

export function useAuth() {
  const router = useRouter();
  const { user, token, isLoading, setAuth, logout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      setError(null);
      setIsPending(true);
      const response = await authService.login(payload);
      const { accessToken, user: userData } = response.data;
      setAuth(userData, accessToken);

      if (userData.role === 'PARTICIPANT') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [setAuth, router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      setError(null);
      setIsPending(true);
      const response = await authService.register(payload);
      const { accessToken, user: userData } = response.data;
      setAuth(userData, accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [setAuth, router]);

  const logoutUser = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return { user, token, isLoading, isPending, error, login, register, logout: logoutUser };
}
