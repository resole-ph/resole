import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { notification, notificationDevice, notificationPreference } from '@/db/schema';
import type { Notification, CreateNotification, NotificationDevice, NotificationPreference } from '@/features/notifications/types/types';

export async function createNotification(data: CreateNotification): Promise<Notification | null> {
  try {
    const rows = await db
      .insert(notification)
      .values(data)
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[] | null> {
  try {
    return await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return null;
  }
}

export async function getNotificationForUser(
  userId: string, 
  notificationId: number
): Promise<Notification | null> {
  try {
    const rows = await db
      .select()
      .from(notification)
      .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error fetching notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(
  userId: string, 
  notificationId: number
): Promise<Notification | null> {
  try {
    const rows = await db
      .update(notification)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)))
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ id: number }[] | null> {
  try {
    return await db
      .update(notification)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(notification.userId, userId), eq(notification.isRead, false)))
      .returning({ id: notification.id });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return null;
  }
}

export async function registerExpoPushToken(
  userId: string, 
  expoPushToken: string, 
  platform?: string | null
): Promise<NotificationDevice | null> {
  try {
    const rows = await db
      .insert(notificationDevice)
      .values({
        userId,
        expoPushToken,
        platform: platform ?? null,
        isActive: true,
        disabledAt: null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: notificationDevice.expoPushToken,
        set: {
          userId,
          platform: platform ?? null,
          isActive: true,
          disabledAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error registering Expo push token:', error);
    return null;
  }
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
  try {
    const rows = await db
      .select()
      .from(notificationPreference)
      .where(eq(notificationPreference.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      // Create default preferences if they don't exist
      const newPrefs = await db
        .insert(notificationPreference)
        .values({
          userId,
        })
        .returning();
      return newPrefs[0] ?? null;
    }

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  data: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<NotificationPreference | null> {
  try {
    const rows = await db
      .update(notificationPreference)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreference.userId, userId))
      .returning();

    if (rows.length === 0) {
      // Create if doesn't exist (though it should be created by getNotificationPreferences)
      const newPrefs = await db
        .insert(notificationPreference)
        .values({
          userId,
          ...data,
        })
        .returning();
      return newPrefs[0] ?? null;
    }

    return rows[0] ?? null;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return null;
  }
}
