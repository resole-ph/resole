export type AuthMode = 'login' | 'signup';

export type Intent = 'buy' | 'sell' | 'donate';

/** Mirrors the web `user` table shape returned by the auth/profile routes. */
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  address: string | null;
  city: string | null;
  contactNo: string | null;
  description: string | null;
  coins: number;
  intent: Intent;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type AuthResponse = {
  user: User;
  sessionToken: string;
  sessionExpiresAt: string;
};

export type UpdateProfileInput = {
  name?: string;
  intent?: Intent;
  city?: string;
  contactNo?: string;
  address?: string;
  image?: string;
  description?: string;
};
