import { randomUUID, randomBytes } from 'node:crypto';
import { db } from '@/config/db';
import { and, eq, desc, count, isNull, or, sql } from 'drizzle-orm';
import { account, session, user, save, login, rating, shoeListing, transaction, classificaitonEnum, verification } from '@/db/schema';
import {
  createSessionToken,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from '@/lib/auth';
import { clearAuthCache, invalidateAuthCache } from '@/lib/request-auth';
import type { 
  User, 
  Session, 
  Account, 
  UpdateUserProfileInput,
  CreateCredentialsInput,
  CreateGoogleUserInput,
} from '@/features/auth/types/types';
export type { User, Session, Account };

async function getLoginStreak(logins: Date[]) {
  if (logins.length === 0) {
    return 0;
  }

  const normalizeToMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const uniqueDaysMs = Array.from(
    new Set(logins.map(l => normalizeToMidnight(l).getTime()))
  );
  const uniqueDays = uniqueDaysMs.map(ms => new Date(ms));

  const today = normalizeToMidnight(new Date());
  const lastLoginDay = uniqueDays[0];

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceLastLogin = (today.getTime() - lastLoginDay.getTime()) / msPerDay;

  if (daysSinceLastLogin > 1) {
    return 0;
  }

  let streak = 1;

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const currentDay = uniqueDays[i];
    const previousDay = uniqueDays[i + 1]; 

    const diffInDays = (currentDay.getTime() - previousDay.getTime()) / msPerDay;

    if (diffInDays === 1) {
      streak++;
    } else {
      break; 
    }
  }

  return streak;
}

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

export async function getUserProfileById(userId: string) {
  try {
    const users = await db
      .select()
      .from(user)
      .where(and(eq(user.id, userId), isNull(user.deletedAt)))
      .limit(1);

    const userRecord = users[0];
    if (!userRecord) {
      return null;
    }

    const ratingRows = await db
      .select({
        overallRating: sql<number>`coalesce(avg(${rating.rating}), 0)`,
        reviewCount: count(rating.id),
      })
      .from(rating)
      .where(and(eq(rating.rateeId, userId), isNull(rating.deletedAt)));

    const ratingStats = ratingRows[0];

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      image: userRecord.image,
      address: userRecord.address,
      city: userRecord.city,
      location: userRecord.city || userRecord.address || null,
      contactNo: userRecord.contactNo,
      description: userRecord.description,
      coins: userRecord.coins,
      intent: userRecord.intent,
      unit: userRecord.unit,
      classification: userRecord.classificaiton,
      overallRating: Number(ratingStats?.overallRating ?? 0),
      reviewCount: Number(ratingStats?.reviewCount ?? 0),
      joinedAt: userRecord.createdAt,
      joinedYear: userRecord.createdAt.getFullYear(),
      updatedAt: userRecord.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserStatsById(userId: string) {
  try {
    const saved = await db
      .select({ value: count(save.userId) })
      .from(save)
      .where(eq(save.userId, userId));

    const listings = await db
      .select({ value: count(shoeListing.id) })
      .from(shoeListing)
      .where(eq(shoeListing.userId, userId));

    const sales = await db
      .select({ value: count(transaction.id) })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .where(
        and(
          eq(shoeListing.userId, userId), 
          eq(transaction.type, 'sale'),
          eq(transaction.isCompleted, true)
        )
      );

    const swaps = await db
      .select({ value: count(transaction.id) })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .where(
        and(
          eq(transaction.type, 'swap'),
          or(eq(shoeListing.userId, userId), eq(transaction.recipientId, userId)),
          eq(transaction.isCompleted, true)
        ),
      );

    const coins = await db
      .select({ value: user.coins })
      .from(user)
      .where(eq(user.id, userId));
    
    const logins = await db
      .select({ date: login.createdAt })
      .from(login)
      .where(eq(login.userId, userId))
      .orderBy(desc(login.createdAt));
    
    const loginStreak = await getLoginStreak(logins.map(item => item.date))

    return {
      pairsSaved: saved[0].value,
      coinBalance: coins[0].value,
      loginStreak: loginStreak,
      listingCount: listings[0].value,
      salesCount: sales[0].value,
      swapsCount: swaps[0].value,
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
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
        intent: input.intent ?? 'buy',
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
        intent: 'buy',
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
    invalidateAuthCache(token);
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

    if (data.unit !== undefined) {
      setObj.unit = data.unit;
    }

    if (data.classification !== undefined) {
      setObj.classificaiton = data.classification;
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
    const deleted = await db.transaction(async (tx) => {
      const updatedUsers = await tx
        .update(user)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, userId), isNull(user.deletedAt)))
        .returning({ id: user.id });

      if (updatedUsers.length === 0) {
        return false;
      }

      // Revoke every device's session as part of the same operation.
      await tx.delete(session).where(eq(session.userId, userId));
      return true;
    });

    if (deleted) clearAuthCache();
    return deleted;
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

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_TOKEN_THROTTLE_MS = 60 * 1000;

export async function createPasswordResetToken(email: string): Promise<string | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return null;
    }

    const userRecord = await getUserByEmail(normalizedEmail);
    if (!userRecord || userRecord.deletedAt) {
      return null;
    }

    const credentialsAccount = await getAccountByUserIdAndProviderId(userRecord.id, 'credentials');
    if (!credentialsAccount) {
      return null;
    }

    const existingTokens = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, normalizedEmail))
      .orderBy(desc(verification.createdAt))
      .limit(1);

    // Uses expiresAt (app-set) instead of createdAt (DB-set) to avoid clock drift.
    const mostRecent = existingTokens[0];
    if (mostRecent && mostRecent.expiresAt.getTime() - RESET_TOKEN_TTL_MS + RESET_TOKEN_THROTTLE_MS > Date.now()) {
      return null;
    }

    // Deletes ALL rows for this identifier; add a purpose column if this table gains a second use case.
    await db.delete(verification).where(eq(verification.identifier, normalizedEmail));

    const token = randomBytes(RESET_TOKEN_BYTES).toString('base64url');

    await db.insert(verification).values({
      id: randomUUID(),
      identifier: normalizedEmail,
      value: token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getEmailForValidResetToken(token: string): Promise<string | null> {
  try {
    if (!token) {
      return null;
    }

    const rows = await db
      .select()
      .from(verification)
      .where(eq(verification.value, token))
      .limit(1);

    const record = rows[0];
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return null;
    }

    return record.identifier;
  } catch (error) {
    console.error('Error validating password reset token:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function consumePasswordResetToken(token: string, newPassword: string): Promise<boolean> {
  try {
    const email = await getEmailForValidResetToken(token);
    if (!email) {
      return false;
    }

    const userRecord = await getUserByEmail(email);
    if (!userRecord || userRecord.deletedAt) {
      return false;
    }

    // Transaction: token stays valid if any step fails.
    await db.transaction(async (tx) => {
      const hashed = hashPassword(newPassword);
      await tx
        .update(account)
        .set({
          password: hashed,
          updatedAt: new Date(),
        })
        .where(and(eq(account.userId, userRecord.id), eq(account.providerId, 'credentials')));

      await tx.delete(verification).where(eq(verification.value, token));

      await tx.delete(session).where(eq(session.userId, userRecord.id));
    });
    clearAuthCache();

    return true;
  } catch (error) {
    console.error('Error consuming password reset token:', error instanceof Error ? error.message : error);
    return false;
  }
}
