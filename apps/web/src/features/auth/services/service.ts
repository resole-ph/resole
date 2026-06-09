import { db } from '@/config/db';
import { user, save, login } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

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
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return users[0] ?? null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserStatsById(userId: string) {
  try {
    const saved = await db
      .select({ value: count(save.userId) })
      .from(save)
      .where(eq(save.userId, userId));

    const coins = await db
      .select({ value: user.coins })
      .from(user)
      .where(eq(user.id, userId));
    
    const logins = await db
      .select({ date: login.createdAt })
      .from(login)
      .where(eq(login.userId, userId))
      .orderBy(desc(login.createdAt));
    
    const loginStreak = getLoginStreak(logins.map(item => item.date))

    return {
      pairsSaved: saved[0].value,
      coinBalance: coins[0].value,
      loginStreak: loginStreak
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
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