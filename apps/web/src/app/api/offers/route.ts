import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createTransaction, createSale } from '@/features/transaction/services/service';
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
    return NextResponse.json({ error: 'Invalid notification id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 404 });
  }

  const body = await request.json();
  body['recipientId'] = currentUser.user.id;
  body['listingId'] = shoeListingId;
  const { price, ...transactionBody } = body;

  const transactionDetails = await createTransaction(transactionBody);
  if (!transactionDetails) {
    return NextResponse.json({ error: 'Failed to create sale transaction' }, { status: 400 });
  }

  const sale = await createSale(transactionDetails.id, price);
  if (!sale) {
    return NextResponse.json({ error: 'Failed to retrieve sale details' }, { status: 400 });
  }

  const { transaction, ...saleDetails } = sale;

  return NextResponse.json({
    transactionDetails: transactionDetails,
    swapDetails: saleDetails
  });
}