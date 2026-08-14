import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { updateUserProfile, deleteUser, getUserProfileById } from '@/features/auth/services/service';
import { normalizeContactNo, isValidEmail } from '@/lib/auth';
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await getUserProfileById(currentUser.user.id);
  if (!userProfile) {
    return NextResponse.json({ error: 'Unable to fetch user profile' }, { status: 500 });
  }

  return NextResponse.json({ user: userProfile });
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

  if (typeof body?.intent === 'string' && ['buy', 'sell', 'donate'].includes(body.intent)) {
    updates.intent = body.intent as 'buy' | 'sell' | 'donate';
  }

  if (typeof body?.unit === 'string' && ['us', 'uk', 'eu', 'cm'].includes(body.unit)) {
    updates.unit = body.unit as 'us' | 'uk' | 'eu' | 'cm';
  }

  if (
    typeof body?.classification === 'string'
    && ['men', 'women', 'children'].includes(body.classification)
  ) {
    updates.classification = body.classification as 'men' | 'women';
  }

  const cityValue = typeof body?.city === 'string'
    ? body.city.trim()
    : typeof body?.location === 'string'
      ? (body.location as string).trim()
      : '';

  if (cityValue) {
    updates.city = cityValue;
  }

  const contactValue = body?.contactNo || body?.phoneNumber || body?.phone || '';

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
