import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getNotificationsByUserId } from '@/features/notifications/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await getNotificationsByUserId(currentUser.user.id);

  if (!notifications) {
    return NextResponse.json({ error: 'Unable to fetch notifications' }, { status: 500 });
  }

  const unreadCount = notifications.filter((notificationItem) => !notificationItem.isRead).length;

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}