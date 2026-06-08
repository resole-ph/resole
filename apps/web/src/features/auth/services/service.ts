import { db } from '@/config/db';
import { user, save, login } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

function getNumberOfDays(startDate: Date, endDate: Date) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  return (endDate.getTime() - startDate.getTime()) / oneDayInMs;
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
      .selectDistinct({ date: login.createdAt})
      .from(login)
      .where(eq(login.userId, userId))
      .orderBy(desc(save.createdAt));
    
    let i;
    if (getNumberOfDays(logins[0].date, new Date()) < 2) {
      i = 2;
      while (getNumberOfDays(logins[i + 1].date, logins[i].date) <= 1 && i < logins.length - 1) 
        i++;
    }
    else {
      i = 1;
    }

    return {
      pairsSaved: saved[0].value,
      coinBalance: coins[0].value,
      loginStreak: i
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