import { NextResponse } from 'next/server';
import { createCredentialsUser, getUserByEmail, createSessionForUser, type User, type Session } from '@/features/auth/services/service';
import {
  isStrongPassword,
  isValidEmail,
  normalizeContactNo,
  normalizeEmail,
} from '@/lib/auth';
import { randomUUID } from 'node:crypto';

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
  }, { status: 201 });

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

  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === 'string' ? body.password : '';
  const contactNo = normalizeContactNo(body?.contactNo);
  const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : '';
  const address = typeof body?.address === 'string' && body.address.trim() ? body.address.trim() : null;
  const city = typeof body?.city === 'string' && body.city.trim() ? body.city.trim() : null;
  const image = typeof body?.image === 'string' && body.image.trim() ? body.image.trim() : null;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number',
    }, { status: 400 });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const newUser = await createCredentialsUser({
      id: randomUUID(),
      name: name || email.split('@')[0] || 'Resole User',
      email,
      password,
      address,
      city,
      contactNo,
      image,
    });

    if (!newUser) {
      return NextResponse.json({ error: 'Unable to create account' }, { status: 500 });
    }

    const session = await createSessionForUser(newUser.id, request);
    if (!session) {
      return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
    }

    return buildAuthResponse(newUser, session);
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
