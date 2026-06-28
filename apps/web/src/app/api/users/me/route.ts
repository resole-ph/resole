import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { updateUserProfile, deleteUser } from '@/features/auth/services/service';
import { normalizeContactNo, isValidEmail } from '@/lib/auth';
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: currentUser.user });
}

export async function PATCH(request: Request) {
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

  const updates: UpdateUserProfileInput = {};

  if (typeof body?.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim();
  }

  if (typeof body?.email === 'string' && body.email.trim()) {
    const email = body.email.trim();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    updates.email = email;
  }

  if (typeof body?.image === 'string') {
    updates.image = body.image.trim();
  }

  if (typeof body?.description === 'string') {
    updates.description = body.description.trim();
  }

  if (typeof body?.address === 'string') {
    updates.address = body.address.trim();
  }

  if (typeof body?.intent === 'string' && ['buy', 'sell', 'explore'].includes(body.intent)) {
    updates.intent = body.intent as 'buy' | 'sell' | 'explore';
  }

  const cityValue = typeof body?.city === 'string'
    ? body.city.trim()
    : typeof body?.location === 'string'
      ? (body.location as string).trim()
      : '';

  if (cityValue) {
    updates.city = cityValue;
  }

  const contactValue = typeof body?.contactNo === 'string'
    ? body.contactNo
    : typeof body?.phoneNumber === 'string'
      ? body.phoneNumber
      : '';

  if (contactValue) {
    const normalizedContactNo = normalizeContactNo(contactValue);
    if (!normalizedContactNo) {
      return NextResponse.json({ error: 'Enter a valid Philippine mobile number' }, { status: 400 });
    }

    updates.contactNo = normalizedContactNo;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes were provided' }, { status: 400 });
  }

  const updatedUser = await updateUserProfile(currentUser.user.id, updates);

  if (!updatedUser) {
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
  }

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = await deleteUser(currentUser.user.id);

  if (!success) {
    return NextResponse.json({ error: 'Unable to delete account' }, { status: 500 });
  }

  const response = NextResponse.json({ message: 'Account deleted successfully' });
  response.cookies.delete('session');
  
  return response;
}
