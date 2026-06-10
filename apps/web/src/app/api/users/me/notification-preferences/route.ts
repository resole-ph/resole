import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getNotificationPreferences, updateNotificationPreferences } from '@/features/notifications/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferences = await getNotificationPreferences(currentUser.user.id);

  if (!preferences) {
    return NextResponse.json({ error: 'Unable to fetch notification preferences' }, { status: 500 });
  }

  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, boolean> = {};

  if (typeof body?.listing === 'boolean') {
    updates.listing = body.listing;
  }

  if (typeof body?.offer === 'boolean') {
    updates.offer = body.offer;
  }

  if (typeof body?.promotion === 'boolean') {
    updates.promotion = body.promotion;
  }

  if (typeof body?.system === 'boolean') {
    updates.system = body.system;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes were provided' }, { status: 400 });
  }

  const updatedPreferences = await updateNotificationPreferences(currentUser.user.id, updates);

  if (!updatedPreferences) {
    return NextResponse.json({ error: 'Unable to update notification preferences' }, { status: 500 });
  }

  return NextResponse.json({ preferences: updatedPreferences });
}
