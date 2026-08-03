import { type InferSelectModel } from 'drizzle-orm';
import { user, session, account, verification, intentEnum } from '@/db/schema';

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;

export interface AuthSession {
  session: Session;
  user: User;
}

export type intentType = 'buy' | 'sell' | 'donate'

export type UpdateUserProfileInput = {
  name?: string;
  email?: string;
  image?: string;
  description?: string;
  address?: string;
  city?: string;
  contactNo?: string;
  intent?: intentType;
  unit?: 'us' | 'uk' | 'eu' | 'cm';
  classification?: 'men' | 'women';
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
  intent?: intentType;
}

export interface CreateGoogleUserInput {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  googleSub: string;
  contactNo?: string | null;
}
