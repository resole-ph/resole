import { NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/features/auth/services/service';
import { sendPasswordResetEmail } from '@/lib/email';

const GENERIC_RESPONSE = {
  message: "If an account with that email exists, we've sent a password reset link.",
};

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

  try {
    const token = await createPasswordResetToken(email);

    if (token) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

      try {
        await sendPasswordResetEmail(email, resetUrl);
      } catch (error) {
        console.error('Error sending password reset email:', error);
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('Forgot-password error:', error);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
