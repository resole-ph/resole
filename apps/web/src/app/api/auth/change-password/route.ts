import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { changePassword, getAccountByUserIdAndProviderId } from '@/features/auth/services/service';
import { verifyPassword, isStrongPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
  }

  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ 
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
    }, { status: 400 });
  }

  const account = await getAccountByUserIdAndProviderId(currentUser.user.id, 'credentials');
  
  if (!account || !account.password) {
    return NextResponse.json({ error: 'Account not found or not using password authentication' }, { status: 400 });
  }

  if (!verifyPassword(currentPassword, account.password)) {
    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
  }

  const success = await changePassword(currentUser.user.id, newPassword);

  if (!success) {
    return NextResponse.json({ error: 'Unable to change password' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Password changed successfully' });
}
