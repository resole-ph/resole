import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { acceptOffer } from '@/features/transaction/services/service';
import { getTransactionById } from '@/features/transaction/services/service';
import { createNotification } from '@/features/notifications/services/service';

function parseTransactionId(rawId: string) {
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
  const transactionId = parseTransactionId(id);
  if (!transactionId) {
    return NextResponse.json({ error: 'Invalid transaction id' }, { status: 400 });
  }

  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }
  if (transaction.listing.userId !== currentUser.user.id) {
    return NextResponse.json({ error: 'Denied access' }, { status: 401 });
  }
  if (transaction.isAccepted) {
    return NextResponse.json({ error: 'Offer is already accepted' }, { status: 409 });
  }

  const result = await acceptOffer(transaction.id);
  if (!result || !result.isAccepted) {
    return NextResponse.json({ error: 'Failed to accept offer' }, { status: 400 });
  }

  if (transaction.recipientId) {
    await createNotification({
      userId: transaction.recipientId,
      category: 'offer',
      title: 'Offer accepted',
      body: 'Your offer was accepted by the seller.',
      entityType: 'transaction',
      entityId: String(transaction.id),
    });
  }

  return NextResponse.json({ message: "Offer accepted successfully" });
}