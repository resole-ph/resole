import { NextResponse } from 'next/server';
import { deleteSessionByToken } from '@/features/auth/services/service';
import { getSessionTokenFromRequest } from '@/lib/request-auth';

export async function POST(request) {
  const token = getSessionTokenFromRequest(request);

  if (token) {
    await deleteSessionByToken(token);
  }

  const response = NextResponse.json({ message: 'Signed out successfully' });

  // Clear session cookie
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
