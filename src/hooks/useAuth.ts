// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Kicks off session initialisation on first mount (reads stored token → validates
 * via GET /api/auth/me). Returns the current auth state slice.
 */
export function useAuth() {
  const { user, isLoggedIn, isLoading, error, initialise, login, register, logout, clearError } =
    useAuthStore();

  useEffect(() => {
    initialise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoggedIn, isLoading, error, login, register, logout, clearError };
}
