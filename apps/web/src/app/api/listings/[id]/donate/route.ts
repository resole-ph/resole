import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getCharityById } from '@/features/charity/services/service';
import { getShoeListingById } from '@/features/shoe/services/service';
import { donateShoeListing } from '@/features/transaction/services/service';

function parsePositiveInt(rawId: string) {
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function getDonationStatus(errorMessage: string) {
  if (errorMessage === 'Shoe listing not found') {
    return 404;
  }

  if (errorMessage === 'Charity not found') {
    return 404;
  }

  if (
    errorMessage === 'Shoe listing is deleted' ||
    errorMessage === 'Shoe listing is not eligible for donation' ||
    errorMessage === 'Shoe listing has already been donated'
  ) {
    return 400;
  }

  return 500;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to donate shoe listing';
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const shoeListingId = parsePositiveInt(id);
  if (!shoeListingId) {
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }
  if (!shoeListing.isAvailable || shoeListing.archivedAt) {
    return NextResponse.json({ error: 'This listing is no longer available' }, { status: 409 });
  }

  if (shoeListing.seller.id !== currentUser.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const charityId = parsePositiveInt(String(body?.charityId ?? ''));
  if (!charityId) {
    return NextResponse.json({ error: 'Invalid charity id' }, { status: 400 });
  }

  const charity = await getCharityById(charityId);
  if (!charity || charity.deletedAt) {
    return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
  }

  try {
    const donation = await donateShoeListing(currentUser.user.id, shoeListingId, charityId);

    return NextResponse.json({
      donation
    });
  } catch (error: unknown) {
    console.error('Error donating shoe listing:', error);
    const errorMessage = getErrorMessage(error);

    return NextResponse.json(
      { error: errorMessage },
      { status: getDonationStatus(errorMessage) }
    );
  }
}
