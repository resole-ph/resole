import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createTransaction, createSwap } from '@/features/transaction/services/service';
import { getShoeListingById } from '@/features/shoe/services/service';
import { parsePositiveInt } from '@/lib/id';

const MAX_CASH_TOP_UP = 1_000_000;

function parseCashTopUp(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;

  const rawValue = String(value).trim();
  const topUp = Number(rawValue);
  if (!/^\d+(?:\.\d{1,2})?$/.test(rawValue) || !Number.isFinite(topUp) || topUp > MAX_CASH_TOP_UP) {
    throw new Error('Cash top-up must be between ₱0 and ₱1,000,000 with at most two decimal places');
  }

  return topUp;
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
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 404 });
  }
  if (!shoeListing.isAvailable || shoeListing.archivedAt) {
    return NextResponse.json({ error: 'This listing is no longer available' }, { status: 409 });
  }

  if (shoeListing.seller.id === currentUser.user.id) {
    return NextResponse.json({ error: 'You cannot swap for your own listing' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.listings) || body.listings.length === 0) {
    return NextResponse.json({ error: 'At least one listing is required for a swap offer' }, { status: 400 });
  }

  const listings = body.listings.map((listing) => Number(listing));
  if (listings.some((listing) => !Number.isInteger(listing) || listing <= 0)) {
    return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 });
  }

  const offeredListings = await Promise.all(listings.map((listing) => getShoeListingById(listing)));
  if (offeredListings.some((listing) => !listing || listing.seller.id !== currentUser.user.id || !listing.isAvailable || listing.archivedAt)) {
    return NextResponse.json({ error: 'You can only offer your own active listings' }, { status: 400 });
  }

  let topUp: number;
  try {
    topUp = parseCashTopUp(body.topUp);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Invalid cash top-up',
    }, { status: 400 });
  }

  const transactionBody = {
    type: 'swap' as const,
    recipientId: currentUser.user.id,
    listingId: shoeListingId,
  };

  const transactionDetails = await createTransaction(transactionBody);
  if (!transactionDetails) {
    return NextResponse.json({ error: 'Failed to create swap transaction' }, { status: 400 });
  }

  const swap = await createSwap(transactionDetails.id, listings, topUp);
  if (!swap) {
    return NextResponse.json({ error: 'Failed to retrieve swap details and items' }, { status: 400 });
  }

  return NextResponse.json({
    transactionDetails: transactionDetails,
    swapDetails: swap
  });
}
