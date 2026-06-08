import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { notification, notificationDevice } from '@/db/schema';

export async function getNotificationsByUserId(userId) {
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

export async function getNotificationForUser(userId, notificationId) {
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

export async function markNotificationAsRead(userId, notificationId) {
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

export async function markAllNotificationsAsRead(userId) {
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

export async function registerExpoPushToken(userId, expoPushToken, platform) {
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