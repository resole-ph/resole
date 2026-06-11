import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  createSessionForUser,
  getAccountByProviderAndAccountId,
  getUserById,
  getUserByEmail,
  createGoogleUser,
  linkGoogleAccountToUser,
  type User,
  type Session
} from '@/features/auth/services/service';
import { 
  normalizeEmail, 
  verifyGoogleIdToken,
  type GoogleProfile 
} from '@/lib/auth';

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

  const provider = typeof body?.provider === 'string' ? body.provider.toLowerCase().trim() : 'google';
  
  if (provider !== 'google') {
    return NextResponse.json({ error: 'Only Google social sign-in is supported' }, { status: 400 });
  }

  const token = typeof body?.idToken === 'string'
    ? body.idToken
    : typeof body?.token === 'string'
      ? body.token
      : typeof body?.credential === 'string'
        ? body.credential
        : '';

  if (!token) {
    return NextResponse.json({ error: 'Google identity token or credential is required' }, { status: 400 });
  }

  const profile: GoogleProfile | null = await verifyGoogleIdToken(token);

  if (!profile) {
    return NextResponse.json({ 
      error: 'Invalid Google identity token or verification failed' 
    }, { status: 401 });
  }

  const email = normalizeEmail(profile.email);
  if (!email) {
    return NextResponse.json({ error: 'Invalid Google account email' }, { status: 400 });
  }

  const existingGoogleAccount = await getAccountByProviderAndAccountId('google', profile.sub);
  let authenticatedUser: User | null = null;

  if (existingGoogleAccount) {
    authenticatedUser = await getUserById(existingGoogleAccount.userId);
    if (!authenticatedUser || authenticatedUser.deletedAt) {
      return NextResponse.json({ error: 'Unable to authenticate Google account' }, { status: 401 });
    }
  } else {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      authenticatedUser = existingUser;
      const linkedAccount = await linkGoogleAccountToUser({
        userId: existingUser.id,
        googleSub: profile.sub,
      });

      if (!linkedAccount) {
        return NextResponse.json({ error: 'Unable to link Google account' }, { status: 500 });
      }
    } else {
      authenticatedUser = await createGoogleUser({
        id: randomUUID(),
        name: profile.name,
        email,
        image: profile.image || null,
        googleSub: profile.sub,
      });

      if (!authenticatedUser) {
        return NextResponse.json({ error: 'Unable to create account' }, { status: 500 });
      }
    }
  }

  const session = await createSessionForUser(authenticatedUser.id, request);
  if (!session) {
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }

  return buildAuthResponse(authenticatedUser, session);
}
