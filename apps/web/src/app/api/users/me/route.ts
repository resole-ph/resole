import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { updateUserProfile } from '@/features/auth/services/service';
import { normalizeContactNo } from '@/lib/auth';
import type { UpdateUserProfileInput } from '@/features/auth/types/types';

export async function GET(request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: currentUser.user });
}

export async function PATCH(request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: UpdateUserProfileInput = {};

  if (typeof body?.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim();
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
    updates.intent = body.intent;
  }

  const cityValue = typeof body?.city === 'string'
    ? body.city.trim()
    : typeof body?.location === 'string'
      ? body.location.trim()
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
