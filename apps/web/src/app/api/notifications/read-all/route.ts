import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { markAllNotificationsAsRead } from '@/features/notifications/services/service';

export async function POST(request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updatedNotifications = await markAllNotificationsAsRead(currentUser.user.id);

  if (!updatedNotifications) {
    return NextResponse.json({ error: 'Unable to update notifications' }, { status: 500 });
  }

  return NextResponse.json({
    updatedCount: updatedNotifications.length,
  });
}