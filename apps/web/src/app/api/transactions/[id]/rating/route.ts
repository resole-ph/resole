import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getTransactionById } from '@/features/transaction/services/service';
import { createRating } from '@/features/user-action/services/service';
import { NEXT_BODY_SUFFIX } from 'next/dist/lib/constants';

function parseTransactionId(rawId: string) {
  const transactionId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return null;
  }

  return transactionId;
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
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }
  if (transaction.listing.userId === currentUser.user.id) {
    return NextResponse.json({ error: 'Attempt to rate own listing denied' }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
    }

    if (!body.rating) {
      return NextResponse.json({ error: 'No rating provided' }, { status: 400 });
    }

    if (!body.rateeId) {
      return NextResponse.json({ error: 'No ratee provided' }, { status: 400 });
    }

    if (typeof body.rating !== 'number' || ![1, 2, 3, 4, 5].includes(body.rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    const rating = await createRating({
      rating: body.rating,
      raterId: currentUser.user.id,
      rateeId: body.rating,
      transactionId: transactionId,
      comment: body.comment ?? null,
      raterRole: body.raterRole ?? null
    })

    return NextResponse.json({ rating: rating });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}