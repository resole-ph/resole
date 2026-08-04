import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createTransaction, createSwap } from '@/features/transaction/services/service';
import { getShoeListingById } from '@/features/shoe/services/service';

function parseShoeListingId(rawId: string) {
  const shoeListingId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(shoeListingId) || shoeListingId <= 0) {
    return null;
  }

  return shoeListingId;
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
  const shoeListingId = parseShoeListingId(id);
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

  const body = await request.json();
  body['recipientId'] = currentUser.user.id;
  body['listingId'] = shoeListingId;
  const { listings, ...transactionBody } = body;

  const transactionDetails = await createTransaction(transactionBody);
  if (!transactionDetails) {
    return NextResponse.json({ error: 'Failed to create swap transaction' }, { status: 400 });
  }

  const swap = await createSwap(transactionDetails.id, listings);
  if (!swap) {
    return NextResponse.json({ error: 'Failed to retrieve swap details and items' }, { status: 400 });
  }

  const { transaction, ...swapDetails } = swap;

  return NextResponse.json({
    transactionDetails: transactionDetails,
    swapDetails: swapDetails
  });
}
