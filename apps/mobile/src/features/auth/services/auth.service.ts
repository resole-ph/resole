import { apiFetch } from '@/lib/api-client';
import { invalidateCache } from '@/lib/cache';
import { clearSessionToken, saveSessionToken } from '@/lib/session';
import { queryClient } from '@/queries';
import type { AuthResponse, UpdateProfileInput, User } from '../types/auth.types';

export const authService = {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/api/auth/sign-up', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    if (!res?.sessionToken) {
      throw new Error('Sign up did not return a session token. Please try again.');
    }
    await saveSessionToken(res.sessionToken);
    return res;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/api/auth/sign-in', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    if (!res?.sessionToken) {
      throw new Error('Sign in did not return a session token. Please try again.');
    }
    await saveSessionToken(res.sessionToken);
    return res;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email },
    });
  },

  async signOut(): Promise<void> {
    try {
      await apiFetch('/api/auth/sign-out', { method: 'POST' });
    } finally {
      await clearSessionToken();
      // Both caches outlive individual screens. Leaving either populated lets
      // the next unauthenticated render (or the next account) see data from
      // the session that just ended.
      invalidateCache();
      await queryClient.cancelQueries();
      queryClient.clear();
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

  async changePassword(body: {currentPassword: string, newPassword: string}) {
    await apiFetch(`/api/auth/change-password`, {
      method: 'POST',
      body: body
    })
  }
};
