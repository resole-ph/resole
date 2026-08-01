import { NextResponse } from 'next/server';
import {
  consumePasswordResetToken,
  getEmailForValidResetToken,
} from '@/features/auth/services/service';
import { isStrongPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') ?? '';

  const email = token ? await getEmailForValidResetToken(token) : null;

  return NextResponse.json({ valid: Boolean(email) });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = typeof body?.token === 'string' ? body.token : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
  }

  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    }, { status: 400 });
  }

  const success = await consumePasswordResetToken(token, newPassword);

  if (!success) {
    return NextResponse.json({
      error: 'This reset link is invalid or has expired. Please request a new one.',
    }, { status: 400 });
  }

  return NextResponse.json({ message: 'Password updated successfully' });
}
