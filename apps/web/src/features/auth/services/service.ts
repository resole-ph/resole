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
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

export async function getUserById(userId: string) {
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

export async function getUserByEmail(email: string) {
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

export async function getAccountByProviderAndAccountId(providerId: string, accountId: string) {
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

export async function getAccountByUserIdAndProviderId(userId: string, providerId: string) {
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

export async function createCredentialsUser({
  id,
  name,
  email,
  password,
  address,
  city,
  contactNo,
  image,
}) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id,
        name,
        email,
        emailVerified: false,
        image: image ?? null,
        address: address ?? null,
        city: city ?? null,
        contactNo: contactNo ?? null,
        description: 'I love shoes!',
        coins: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(account).values({
        id,
        userId: id,
        accountId: email,
        providerId: 'credentials',
        password: hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return await getUserById(id);
  } catch (error) {
    console.error('Error creating credentials user:', error);
    return null;
  }
}

export async function createGoogleUser({
  id,
  name,
  email,
  image,
  googleSub,
}) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id,
        name,
        email,
        emailVerified: true,
        image: image ?? null,
        address: null,
        city: null,
        contactNo: null,
        description: 'I love shoes!',
        coins: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(account).values({
        id: googleSub,
        userId: id,
        accountId: googleSub,
        providerId: 'google',
        idToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return await getUserById(id);
  } catch (error) {
    console.error('Error creating Google user:', error);
    return null;
  }
}

export async function linkGoogleAccountToUser({ userId, googleSub }) {
  try {
    await db.insert(account).values({
      id: googleSub,
      userId,
      accountId: googleSub,
      providerId: 'google',
      idToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return getAccountByProviderAndAccountId('google', googleSub);
  } catch (error) {
    console.error('Error linking Google account:', error);
    return null;
  }
}

export async function createSessionForUser(userId: string, request: Request) {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function verifyCredentials(email: string, password: string) {
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

export async function deleteSessionByToken(token: string) {
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
) {
  try {
    const setObj: Partial<typeof user.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      setObj.name = data.name;
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