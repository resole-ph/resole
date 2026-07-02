import { apiFetch } from '@/lib/api-client';
import { clearSessionToken, saveSessionToken } from '@/lib/session';
import type { AuthResponse, UpdateProfileInput, User } from '../types/auth.types';

export const authService = {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/api/auth/sign-up', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await saveSessionToken(res.sessionToken);
    return res;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/api/auth/sign-in', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await saveSessionToken(res.sessionToken);
    return res;
  },

  async signOut(): Promise<void> {
    try {
      await apiFetch('/api/auth/sign-out', { method: 'POST' });
    } finally {
      await clearSessionToken();
    }
  },

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const res = await apiFetch<{ user: User }>('/api/users/me', {
      method: 'PATCH',
      body: input,
    });
    return res.user;
  },

  async getProfile(): Promise<User | null> {
    try {
      const res = await apiFetch<{ user: User }>('/api/users/me');
      return res.user;
    } catch {
      return null;
    }
  },
};
