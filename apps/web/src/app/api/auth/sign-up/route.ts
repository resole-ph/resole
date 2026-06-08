import { NextResponse } from 'next/server';
import { createCredentialsUser, getUserByEmail, createSessionForUser } from '@/features/auth/services/service';
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
  }, { status: 201 });

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

  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === 'string' ? body.password : '';
  const contactNo = normalizeContactNo(body?.contactNo);
  const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : '';
  const address = typeof body?.address === 'string' ? body.address.trim() : '';
  const city = typeof body?.city === 'string' ? body.city.trim() : '';
  const image = typeof body?.image === 'string' ? body.image.trim() : '';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number',
    }, { status: 400 });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const user = await createCredentialsUser({
    id: randomUUID(),
    name: name || email.split('@')[0] || 'Resole User',
    email,
    password,
    address: address || null,
    city: city || null,
    contactNo: contactNo || null,
    image: image || null,
  });

  if (!user) {
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 });
  }

  const session = await createSessionForUser(user.id, request);
  if (!session) {
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }

  return buildAuthResponse(user, session);
}