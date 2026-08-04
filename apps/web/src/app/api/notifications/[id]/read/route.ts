import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getNotificationForUser, markNotificationAsRead } from '@/features/notifications/services/service';
import { parsePositiveInt } from '@/lib/id';

export async function POST(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const notificationId = parsePositiveInt(id);
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
