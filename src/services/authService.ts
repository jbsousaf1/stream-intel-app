// src/services/authService.ts
import { api, setToken, clearToken } from './api';

export interface User {
  id?: number;
  username: string;
  display_name: string;
  email: string;
  auth_type: string;
  member_since: string;
  profile_pic: string;
  home_country: string;
  library_public: boolean;
  is_admin?: boolean;
}

export interface AuthResponse {
  ok: boolean;
  token?: string;
  username?: string;
  error?: string;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  if (data.token) {
    await setToken(data.token);
  }
  return data;
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { username, password },
  });
  if (data.token) {
    await setToken(data.token);
  }
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore errors on logout
  }
  await clearToken();
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await api<User>('/api/auth/me');
    return data;
  } catch {
    return null;
  }
}

export async function googleLoginInit(): Promise<{ auth_url?: string; error?: string }> {
  return api<{ auth_url?: string; error?: string }>('/api/auth/google-init');
}

export async function ping(): Promise<boolean> {
  try {
    await api('/api/auth/ping');
    return true;
  } catch {
    return false;
  }
}
