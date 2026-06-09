import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '@/config/db';
import { account, session, user } from '@/db/schema';
import {
  createSessionToken,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from '@/lib/auth';
import type { User, Session, Account, UpdateUserProfileInput } from '@/features/auth/types/types';
export type { User, Session, Account };

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return users[0] ?? null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return null;
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    return users[0] ?? null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getAccountByProviderAndAccountId(
  providerId: string, 
  accountId: string
): Promise<Account | null> {
  try {
    const rows = await db
      .select()
      .from(account)
      .where(and(eq(account.providerId, providerId), eq(account.accountId, accountId)))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error fetching account:', error);
    return null;
  }
}

export async function getAccountByUserIdAndProviderId(
  userId: string, 
  providerId: string
): Promise<Account | null> {
  try {
    const rows = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, providerId)))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error fetching account by user:', error);
    return null;
  }
}

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

export async function createCredentialsUser(input: CreateCredentialsInput): Promise<User | null> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: input.id,
        name: input.name,
        email: input.email,
        emailVerified: false,
        image: input.image ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        contactNo: input.contactNo ?? null,
        description: 'I love shoes!',
        coins: 0,
        intent: 'explore',
      });

      await tx.insert(account).values({
        id: randomUUID(),
        userId: input.id,
        accountId: input.email,
        providerId: 'credentials',
        password: hashPassword(input.password),
      });
    });

    return await getUserById(input.id);
  } catch (error) {
    console.error('Error creating credentials user:', error);
    return null;
  }
}

export interface CreateGoogleUserInput {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  googleSub: string;
  contactNo?: string | null;
}

export async function createGoogleUser(input: CreateGoogleUserInput): Promise<User | null> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: input.id,
        name: input.name,
        email: input.email,
        emailVerified: true,
        image: input.image ?? null,
        address: null,
        city: null,
        contactNo: input.contactNo ?? null,
        description: 'I love shoes!',
        coins: 0,
        intent: 'explore',
      });

      await tx.insert(account).values({
        id: input.googleSub,
        userId: input.id,
        accountId: input.googleSub,
        providerId: 'google',
        idToken: null,
      });
    });

    return await getUserById(input.id);
  } catch (error) {
    console.error('Error creating Google user:', error);
    return null;
  }
}

export async function linkGoogleAccountToUser({ 
  userId, 
  googleSub 
}: { 
  userId: string; 
  googleSub: string; 
}): Promise<Account | null> {
  try {
    await db.insert(account).values({
      id: googleSub,
      userId,
      accountId: googleSub,
      providerId: 'google',
      idToken: null,
    });

    return getAccountByProviderAndAccountId('google', googleSub);
  } catch (error) {
    console.error('Error linking Google account:', error);
    return null;
  }
}

export async function createSessionForUser(userId: string, request: Request): Promise<Session | null> {
  try {
    const token = createSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const rows = await db
      .insert(session)
      .values({
        id: randomUUID(),
        userId,
        token,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
        expiresAt,
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  try {
    const userRecord = await getUserByEmail(email);
    if (!userRecord) {
      return null;
    }

    const credentialsAccount = await getAccountByUserIdAndProviderId(userRecord.id, 'credentials');
    if (!credentialsAccount || !credentialsAccount.password) {
      return null;
    }

    if (!verifyPassword(password, credentialsAccount.password)) {
      return null;
    }

    return userRecord;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

export async function deleteSessionByToken(token: string): Promise<boolean> {
  try {
    await db.delete(session).where(eq(session.token, token));
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileInput,
): Promise<User | null> {
  try {
    const setObj: Partial<typeof user.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      setObj.name = data.name;
    }

    if (data.email !== undefined) {
      const normalizedEmail = normalizeEmail(data.email);
      if (normalizedEmail) {
        setObj.email = normalizedEmail;
      }
    }

    if (data.image !== undefined) {
      setObj.image = data.image;
    }

    if (data.description !== undefined) {
      setObj.description = data.description;
    }

    if (data.address !== undefined) {
      setObj.address = data.address;
    }

    if (data.city !== undefined) {
      setObj.city = data.city;
    }

    if (data.contactNo !== undefined) {
      setObj.contactNo = data.contactNo;
    }

    if (data.intent !== undefined) {
      setObj.intent = data.intent;
    }

    if (Object.keys(setObj).length === 1) {
      return null;
    }

    const updated = await db
      .update(user)
      .set(setObj)
      .where(eq(user.id, userId))
      .returning();

    return updated[0] ?? null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await db
      .update(user)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Also delete active sessions
    await db.delete(session).where(eq(session.userId, userId));

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export async function changePassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const hashed = hashPassword(newPassword);
    
    await db
      .update(account)
      .set({
        password: hashed,
        updatedAt: new Date(),
      })
      .where(and(eq(account.userId, userId), eq(account.providerId, 'credentials')));

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
}
