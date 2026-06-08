import crypto from 'node:crypto';

const PASSWORD_HASH_ITERATIONS = 310000;
const PASSWORD_HASH_LENGTH = 32;
const PASSWORD_SALT_BYTES = 16;
const SESSION_TOKEN_BYTES = 32;

export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail || null;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

export function normalizeContactNo(contactNo) {
  if (typeof contactNo !== 'string') {
    return null;
  }

  const digits = contactNo.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

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

export function hashPassword(password) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString('hex');
  const derived = crypto
    .scryptSync(password, salt, PASSWORD_HASH_LENGTH)
    .toString('hex');

  return `scrypt$${PASSWORD_HASH_ITERATIONS}$${salt}$${derived}`;
}

export function verifyPassword(password, storedPassword) {
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

export function createSessionToken() {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
}

export function getAllowedGoogleClientIds() {
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

export async function verifyGoogleIdToken(idToken) {
  if (typeof idToken !== 'string' || !idToken.trim()) {
    return null;
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
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
}