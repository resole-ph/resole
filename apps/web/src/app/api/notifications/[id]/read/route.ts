import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getNotificationForUser, markNotificationAsRead } from '@/features/notifications/services/service';

function parseNotificationId(rawId) {
  const notificationId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return null;
  }

  return notificationId;
}

export async function POST(request, context) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notificationId = parseNotificationId(context.params.id);
  if (!notificationId) {
    return NextResponse.json({ error: 'Invalid notification id' }, { status: 400 });
  }

  const existingNotification = await getNotificationForUser(currentUser.user.id, notificationId);
  if (!existingNotification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  const updatedNotification = await markNotificationAsRead(currentUser.user.id, notificationId);

  if (!updatedNotification) {
    return NextResponse.json({ error: 'Unable to update notification' }, { status: 500 });
  }

  return NextResponse.json({
    notification: updatedNotification,
  });
}