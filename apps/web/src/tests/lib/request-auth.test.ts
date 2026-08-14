import { describe, expect, it, vi } from 'vitest';

// `request-auth` imports the Drizzle client at module load, which opens a real
// Postgres pool. `getSessionTokenFromRequest` is pure header parsing and needs
// neither, so both are stubbed at the module boundary.
vi.mock('@/config/db', () => ({ db: {}, sql: {} }));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

const { getSessionTokenFromRequest } = await import('@/lib/request-auth');

/** Builds a bare Request carrying only the headers under test. */
function requestWith(headers: Record<string, string>): Request {
  return new Request('https://resole.test/api/listings', { headers });
}

describe('getSessionTokenFromRequest', () => {
  it('reads the token from an Authorization: Bearer header', () => {
    const request = requestWith({ authorization: 'Bearer abc123' });
    expect(getSessionTokenFromRequest(request)).toBe('abc123');
  });

  it('trims trailing whitespace off a bearer token', () => {
    const request = requestWith({ authorization: 'Bearer abc123 ' });
    expect(getSessionTokenFromRequest(request)).toBe('abc123');
  });

  it('does not tolerate a doubled space after the scheme', () => {
    // The header is split on a single space, so "Bearer  abc" yields an empty
    // second segment and falls through to the cookie. Documented rather than
    // fixed: no client sends this, and loosening the parse widens the surface.
    const request = requestWith({ authorization: 'Bearer  abc123' });
    expect(getSessionTokenFromRequest(request)).toBeNull();
  });

  it('prefers the bearer token over any cookie', () => {
    const request = requestWith({
      authorization: 'Bearer from-header',
      cookie: 'session=from-cookie',
    });
    expect(getSessionTokenFromRequest(request)).toBe('from-header');
  });

  it('falls back to the cookie when the Authorization header has no token', () => {
    const request = requestWith({ authorization: 'Bearer', cookie: 'session=from-cookie' });
    expect(getSessionTokenFromRequest(request)).toBe('from-cookie');
  });

  it('ignores a non-Bearer authorization scheme', () => {
    const request = requestWith({
      authorization: 'Basic abc123',
      cookie: 'session=from-cookie',
    });
    expect(getSessionTokenFromRequest(request)).toBe('from-cookie');
  });

  it('is case-sensitive about the Bearer scheme', () => {
    const request = requestWith({ authorization: 'bearer abc123' });
    expect(getSessionTokenFromRequest(request)).toBeNull();
  });

  it('reads each accepted cookie name', () => {
    expect(getSessionTokenFromRequest(requestWith({ cookie: 'session=a' }))).toBe('a');
    expect(getSessionTokenFromRequest(requestWith({ cookie: 'sessionToken=b' }))).toBe('b');
    expect(getSessionTokenFromRequest(requestWith({ cookie: 'token=c' }))).toBe('c');
  });

  it('applies session > sessionToken > token precedence', () => {
    const request = requestWith({ cookie: 'token=c; sessionToken=b; session=a' });
    expect(getSessionTokenFromRequest(request)).toBe('a');
  });

  it('finds the cookie among unrelated cookies', () => {
    const request = requestWith({ cookie: 'theme=dark; session=abc123; locale=en-PH' });
    expect(getSessionTokenFromRequest(request)).toBe('abc123');
  });

  it('url-decodes the cookie value', () => {
    const request = requestWith({ cookie: 'session=abc%2F123%3D%3D' });
    expect(getSessionTokenFromRequest(request)).toBe('abc/123==');
  });

  it('keeps the rest of a value containing = signs', () => {
    const request = requestWith({ cookie: 'session=abc=123=' });
    expect(getSessionTokenFromRequest(request)).toBe('abc=123=');
  });

  it('skips empty and value-less cookie segments', () => {
    const request = requestWith({ cookie: ';; novalue ;; session=abc123 ;' });
    expect(getSessionTokenFromRequest(request)).toBe('abc123');
  });

  it('does not match a cookie whose name merely ends with the target name', () => {
    const request = requestWith({ cookie: 'not_session=wrong' });
    expect(getSessionTokenFromRequest(request)).toBeNull();
  });

  it('returns null when neither header is present', () => {
    expect(getSessionTokenFromRequest(requestWith({}))).toBeNull();
  });

  it('returns null when the cookie header has no recognised cookie', () => {
    expect(getSessionTokenFromRequest(requestWith({ cookie: 'theme=dark' }))).toBeNull();
  });
});
