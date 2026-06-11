import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/config/db';
import { session, user } from '@/db/schema';
import type { AuthSession } from '@/features/auth/types/types';

function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(';')) {
    const trimmedCookie = cookie.trim();

    if (!trimmedCookie) {
      continue;
    }

    const separatorIndex = trimmedCookie.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedCookie.slice(0, separatorIndex).trim();
    if (name !== cookieName) {
      continue;
    }

    return decodeURIComponent(trimmedCookie.slice(separatorIndex + 1));
  }

  return null;
}

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization');
  const bearerToken = getBearerToken(authorizationHeader);

  if (bearerToken) {
    return bearerToken;
  }

  const cookieHeader = request.headers.get('cookie');
  return (
    getCookieValue(cookieHeader, 'session') ||
    getCookieValue(cookieHeader, 'sessionToken') ||
    getCookieValue(cookieHeader, 'token')
  );
}

export async function getAuthenticatedUser(request: Request): Promise<AuthSession | null> {
  const token = getSessionTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const rows = await db
    .select({
      session,
      user,
    })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(
      and(
        eq(session.token, token),
        gt(session.expiresAt, new Date()),
        isNull(user.deletedAt),
      ),
    )
    .limit(1);

  return (rows[0] as AuthSession) ?? null;
}
