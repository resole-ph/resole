import { db } from '@/config/db';
import { session, user } from '@/db/schema';
import type { AuthSession } from '@/features/auth/types/types';
import { and, eq, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'session',
  'session_token',
  'better-auth.session_token',
];

function getSessionToken(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = request.cookies.get(cookieName)?.value;
    if (token) {
      return token;
    }
  }

  return null;
}

export async function getAuthSession(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  try {
    const rows = await db
      .select({
        session,
        user,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
      .limit(1);

    return (rows[0] as AuthSession | undefined) ?? null;
  } catch (error) {
    console.error('Error fetching auth session:', error);
    return null;
  }
}
