import { NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/features/auth/services/service';
import { normalizeEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

const GENERIC_RESPONSE = {
  message: "If an account with that email exists, we've sent a password reset link.",
};

// Floor every response to this duration so response timing can't be used to
// distinguish "account exists" from "account doesn't exist" / "throttled" (timing side channel).
const MIN_RESPONSE_TIME_MS = 1200;

async function handleForgotPassword(email: string): Promise<void> {
  try {
    const token = await createPasswordResetToken(email);

    if (token) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (!appUrl) {
        console.error('NEXT_PUBLIC_APP_URL is not set; cannot build a password reset link');
        return;
      }

      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return;
      }

      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

      try {
        await sendPasswordResetEmail(normalizedEmail, resetUrl);
      } catch (error) {
        console.error('Error sending password reset email:', error);
      }
    }
  } catch (error) {
    console.error('Forgot-password error:', error);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email : '';

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await Promise.all([
    handleForgotPassword(email),
    new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_TIME_MS)),
  ]);

  return NextResponse.json(GENERIC_RESPONSE);
}
