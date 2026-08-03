import { cookies } from 'next/headers';
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

/**
 * Every API route resolves the caller before doing any real work, so the session
 * lookup used to add a full database round trip (~130ms against the Sydney
 * pooler) to each request. Successful lookups are held in-process for a short
 * window, and concurrent lookups of the same token share one query — the inbox
 * fires three requests at once and would otherwise run the same query three times.
 *
 * Only hits are cached: an unknown token stays a real query, so a freshly issued
 * session is never rejected from stale state. Session deletion invalidates
 * through `invalidateAuthCache` / `clearAuthCache`.
 */
const AUTH_CACHE_TTL_MS = 30_000;

type AuthCacheEntry = {
  expiresAt: number;
  result: Promise<AuthSession | null>;
};

const globalForAuthCache = globalThis as unknown as {
  authCache?: Map<string, AuthCacheEntry>;
};

const authCache = globalForAuthCache.authCache ?? new Map<string, AuthCacheEntry>();

if (process.env.NODE_ENV !== 'production') {
  globalForAuthCache.authCache = authCache;
}

/** Drop one token's cached session — call whenever that session row is deleted. */
export function invalidateAuthCache(token: string) {
  authCache.delete(token);
}

/** Drop every cached session — for deletions that target a user rather than a token. */
export function clearAuthCache() {
  authCache.clear();
}

async function lookupSession(token: string): Promise<AuthSession | null> {
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

export async function getAuthenticatedUser(request: Request): Promise<AuthSession | null> {
  return resolveSession(getSessionTokenFromRequest(request));
}

/**
 * Same lookup for server components, which have no `Request` to read — they take
 * the session cookie from `next/headers` instead.
 */
export async function getAuthenticatedUserFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('session')?.value ??
    cookieStore.get('sessionToken')?.value ??
    cookieStore.get('token')?.value ??
    null;

  return resolveSession(token ?? null);
}

async function resolveSession(token: string | null): Promise<AuthSession | null> {
  if (!token) {
    return null;
  }

  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const entry: AuthCacheEntry = {
    expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
    result: lookupSession(token),
  };
  authCache.set(token, entry);

  try {
    const result = await entry.result;

    // Misses and failures are not worth remembering, and a cached entry must
    // never outlive the session it stands for.
    if (!result) {
      authCache.delete(token);
    } else {
      entry.expiresAt = Math.min(entry.expiresAt, result.session.expiresAt.getTime());
    }

    return result;
  } catch (error) {
    authCache.delete(token);
    throw error;
  }
}
