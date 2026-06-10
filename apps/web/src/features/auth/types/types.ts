import { type InferSelectModel } from 'drizzle-orm';
import { user, session, account, verification } from '@/db/schema';

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;

export interface AuthSession {
  session: Session;
  user: User;
}

export type UpdateUserProfileInput = {
  name?: string;
  email?: string;
  image?: string;
  description?: string;
  address?: string;
  city?: string;
  contactNo?: string;
  intent?: 'buy' | 'sell' | 'explore';
};

export interface CreateCredentialsInput {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string | null;
  city?: string | null;
  contactNo?: string | null;
  image?: string | null;
}

export interface CreateGoogleUserInput {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  googleSub: string;
  contactNo?: string | null;
}
