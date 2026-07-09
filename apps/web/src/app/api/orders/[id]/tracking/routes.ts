import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getTransactionById, getTransactionTrackingByTransactionId } from '@/features/transaction/services/service';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const transactionId = parseInt(id, 10);
  if (!transactionId) {
    return NextResponse.json({ error: 'Invalid transaction id' }, { status: 400 });
  }

  const existingTransaction = await getTransactionById(transactionId);
  if (!existingTransaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  const isBuyer = currentUser.user.id === existingTransaction.recipientId;
  const isSeller = currentUser.user.id === existingTransaction.listing.userId;
  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: 'Access to transaction denied' }, { status: 401 });
  }

  const timeline = await getTransactionTrackingByTransactionId(existingTransaction.id);
  if (!timeline || timeline.length === 0) {
    return NextResponse.json({ error: 'No tracking information found' }, { status: 404 });
  }

  return NextResponse.json({ 
    tracking: timeline 
  });
}