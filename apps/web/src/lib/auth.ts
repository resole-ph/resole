import crypto from 'crypto';

const PASSWORD_HASH_ITERATIONS = 310000;
const PASSWORD_HASH_LENGTH = 32;
const PASSWORD_SALT_BYTES = 16;
const SESSION_TOKEN_BYTES = 32;

export const PASSWORD_REQUIREMENT_MESSAGE = "Password must be at least 8 characters and include uppercase, lowercase, and a number.";

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail || null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
];

const KNOWN_SAFE_DOMAINS = [
  ...COMMON_EMAIL_DOMAINS,
  'ymail.com',
  'rocketmail.com',
  'mail.com',
];

function levenshteinDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = a[i - 1] === b[j - 1]
        ? rows[i - 1][j - 1]
        : 1 + Math.min(rows[i - 1][j - 1], rows[i - 1][j], rows[i][j - 1]);
    }
  }

  return rows[a.length][b.length];
}

export function suggestEmailTypoCorrection(email: string): string | null {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return null;
  }

  const domain = email.slice(atIndex + 1).toLowerCase();
  if (KNOWN_SAFE_DOMAINS.includes(domain)) {
    return null;
  }

  for (const knownDomain of COMMON_EMAIL_DOMAINS) {
    if (levenshteinDistance(domain, knownDomain) <= 2) {
      return `${email.slice(0, atIndex + 1)}${knownDomain}`;
    }
  }

  return null;
}

export function isStrongPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

export function normalizeContactNo(contactNo: unknown): string | null {
  if (typeof contactNo !== 'string') {
    return null;
  }

  const digits = contactNo.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  // Handle Philippine mobile numbers
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+63${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('09')) {
    return `+63${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith('63')) {
    return `+${digits}`;
  }

  return null;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString('hex');
  const derived = crypto
    .scryptSync(password, salt, PASSWORD_HASH_LENGTH)
    .toString('hex');

  return `scrypt$${PASSWORD_HASH_ITERATIONS}$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') {
    return false;
  }

  const parts = storedPassword.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, , salt, storedHash] = parts;
  const derivedHash = crypto
    .scryptSync(password, salt, PASSWORD_HASH_LENGTH)
    .toString('hex');

  const storedBuffer = Buffer.from(storedHash, 'hex');
  const derivedBuffer = Buffer.from(derivedHash, 'hex');

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
}

export function createSessionToken(): string {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
}

export function getAllowedGoogleClientIds(): string[] {
  return [
    process.env.GOOGLE_OAUTH_CLIENT_IDS,
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
  ]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  image?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  if (typeof idToken !== 'string' || !idToken.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json() as Record<string, unknown>;
    const allowedClientIds = getAllowedGoogleClientIds();

    if (allowedClientIds.length === 0) {
      return null;
    }

    const audience = typeof payload.aud === 'string' ? payload.aud : '';
    const issuer = typeof payload.iss === 'string' ? payload.iss : '';
    const email = normalizeEmail(payload.email);
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    const subject = typeof payload.sub === 'string' ? payload.sub : '';

    if (!allowedClientIds.includes(audience)) {
      return null;
    }

    if (issuer !== 'accounts.google.com' && issuer !== 'https://accounts.google.com') {
      return null;
    }

    if (!email || !emailVerified || !subject) {
      return null;
    }

    return {
      sub: subject,
      email,
      name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : email.split('@')[0],
      image: typeof payload.picture === 'string' ? payload.picture.trim() : '',
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}
