export const PASSWORD_REQUIREMENT_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

/** Mirrors the web `isStrongPassword` check so the client rejects passwords the server would. */
export function isStrongPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}
