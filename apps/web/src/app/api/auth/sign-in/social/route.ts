import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  createGoogleUser,
  createSessionForUser,
  getAccountByProviderAndAccountId,
  getUserById,
  getUserByEmail,
  linkGoogleAccountToUser,
} from '@/features/auth/services/service';
import { normalizeEmail, verifyGoogleIdToken } from '@/lib/auth';

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

function buildAuthResponse(user, session) {
  const response = NextResponse.json({
    user,
    sessionToken: session.token,
    sessionExpiresAt: session.expiresAt,
  });

  response.cookies.set('session', session.token, getSessionCookieOptions());
  response.headers.set('x-session-token', session.token);

  return response;
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const provider = typeof body?.provider === 'string' ? body.provider.toLowerCase().trim() : 'google';
  if (provider !== 'google') {
    return NextResponse.json({ error: 'Only Google social sign-in is supported' }, { status: 400 });
  }

  const idToken = typeof body?.idToken === 'string'
    ? body.idToken
    : typeof body?.token === 'string'
      ? body.token
      : typeof body?.credential === 'string'
        ? body.credential
        : '';

  const profile = await verifyGoogleIdToken(idToken);
  if (!profile) {
    return NextResponse.json({ error: 'Invalid Google identity token' }, { status: 401 });
  }

  const email = normalizeEmail(profile.email);
  if (!email) {
    return NextResponse.json({ error: 'Invalid Google account email' }, { status: 400 });
  }

  const existingGoogleAccount = await getAccountByProviderAndAccountId('google', profile.sub);
  let user = null;

  if (existingGoogleAccount) {
    user = await getUserById(existingGoogleAccount.userId);
    if (!user || user.deletedAt) {
      return NextResponse.json({ error: 'Unable to authenticate Google account' }, { status: 401 });
    }
  } else {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      user = existingUser;
      const linkedAccount = await linkGoogleAccountToUser({
        userId: existingUser.id,
        googleSub: profile.sub,
      });

      if (!linkedAccount) {
        return NextResponse.json({ error: 'Unable to link Google account' }, { status: 500 });
      }
    } else {
      user = await createGoogleUser({
        id: randomUUID(),
        name: profile.name,
        email,
        image: profile.image,
        googleSub: profile.sub,
      });

      if (!user) {
        return NextResponse.json({ error: 'Unable to create account' }, { status: 500 });
      }
    }
  }

  const session = await createSessionForUser(user.id, request);
  if (!session) {
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }

  return buildAuthResponse(user, session);
}