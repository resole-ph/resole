import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { registerExpoPushToken } from '@/features/notifications/services/service';

export async function POST(request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const expoPushToken = typeof body?.expoPushToken === 'string' ? body.expoPushToken.trim() : '';
  const platform = typeof body?.platform === 'string' ? body.platform.trim() : null;

  if (!expoPushToken) {
    return NextResponse.json({ error: 'expoPushToken is required' }, { status: 400 });
  }

  const device = await registerExpoPushToken(currentUser.user.id, expoPushToken, platform);

  if (!device) {
    return NextResponse.json({ error: 'Unable to register device' }, { status: 500 });
  }

  return NextResponse.json({
    device,
  });
}