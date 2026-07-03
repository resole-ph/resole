import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { scheduleDonationPickup } from '@/features/transaction/services/service';

function parsePositiveInt(value: unknown) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to schedule donation pickup';
}

function getPickupErrorStatus(errorMessage: string) {
  if (errorMessage === 'Shoe listing not found' || errorMessage === 'Charity not found') {
    return 404;
  }

  if (
    errorMessage === 'Shoe listing is deleted' ||
    errorMessage === 'Shoe listing is not eligible for donation pickup'
  ) {
    return 400;
  }

  return 500;
}

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

  const listingId = parsePositiveInt(body.listingId);
  if (!listingId) {
    return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 });
  }

  const charityId = parsePositiveInt(body.charityId);
  if (!charityId) {
    return NextResponse.json({ error: 'Invalid charity id' }, { status: 400 });
  }

  if (typeof body.pickupAddress !== 'string' || !body.pickupAddress.trim()) {
    return NextResponse.json({ error: 'Pickup address is required' }, { status: 400 });
  }

  if (typeof body.pickupDate !== 'string' || !body.pickupDate.trim()) {
    return NextResponse.json({ error: 'Pickup date is required' }, { status: 400 });
  }

  const pickupDate = new Date(body.pickupDate);
  if (Number.isNaN(pickupDate.getTime()) || pickupDate <= new Date()) {
    return NextResponse.json({ error: 'Pickup date must be a future date' }, { status: 400 });
  }

  try {
    const donationPickup = await scheduleDonationPickup(currentUser.user.id, {
      listingId,
      charityId,
      pickupAddress: body.pickupAddress.trim(),
      pickupDate,
      contactNo: typeof body.contactNo === 'string' && body.contactNo.trim()
        ? body.contactNo.trim()
        : undefined,
      notes: typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim()
        : undefined,
    });

    return NextResponse.json({ donationPickup });
  } catch (error: unknown) {
    console.error('Error scheduling donation pickup:', error);
    const errorMessage = getErrorMessage(error);

    return NextResponse.json(
      { error: errorMessage },
      { status: getPickupErrorStatus(errorMessage) },
    );
  }
}
