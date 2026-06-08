import { NextResponse } from 'next/server';
import { createSessionForUser, verifyCredentials, type User, type Session } from '@/features/auth/services/service';

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

function buildAuthResponse(user: User, session: Session) {
  const response = NextResponse.json({
    user,
    sessionToken: session.token,
    sessionExpiresAt: session.expiresAt,
  });

  response.cookies.set('session', session.token, getSessionCookieOptions());
  response.headers.set('x-session-token', session.token);

  return response;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const session = await createSessionForUser(user.id, request);
  if (!session) {
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }

  return buildAuthResponse(user, session);
}
