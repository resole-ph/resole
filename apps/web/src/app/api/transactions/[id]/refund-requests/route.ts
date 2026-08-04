import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getTransactionById } from '@/features/transaction/services/service';
import { createTicket, getActiveTransactionTicket } from '@/features/ticket/services/service';
import { parsePositiveInt } from '@/lib/id';

const REFUND_REQUEST_REASONS = [
  'item_not_received',
  'item_not_as_described',
  'damaged_item',
  'duplicate_charge',
  'changed_mind',
  'other',
] as const;

function getTextField(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isAllowedRefundReason(reason: string) {
  return (REFUND_REQUEST_REASONS as readonly string[]).includes(reason);
}

function isTransactionParticipant(transaction: Awaited<ReturnType<typeof getTransactionById>>, userId: string) {
  return transaction?.recipientId === userId || transaction?.listing.userId === userId;
}

function serializeTicket(ticket: NonNullable<Awaited<ReturnType<typeof createTicket>>>) {
  return {
    id: ticket.id,
    transactionId: ticket.transactionId,
    reason: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
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
  const transactionId = parsePositiveInt(id);
  if (!transactionId) {
    return NextResponse.json({ error: 'Invalid transaction id' }, { status: 400 });
  }

  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  if (!isTransactionParticipant(transaction, currentUser.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const reason = getTextField(body.reason);
  if (!reason || !isAllowedRefundReason(reason)) {
    return NextResponse.json(
      { error: 'Invalid refund request reason', allowedReasons: REFUND_REQUEST_REASONS },
      { status: 400 }
    );
  }

  const existingRefundRequest = await getActiveTransactionTicket(
    transaction.id,
    'refund_request'
  );
  if (existingRefundRequest) {
    return NextResponse.json({ error: 'Active refund request already exists' }, { status: 409 });
  }

  const details = getTextField(body.description) ?? getTextField(body.details);
  const refundRequest = await createTicket({
    userId: currentUser.user.id,
    transactionId: transaction.id,
    title: `Refund request for transaction ${transaction.id}`,
    issue: 'refund_request',
    description: details ? `${reason}: ${details}` : reason,
  });

  if (!refundRequest) {
    return NextResponse.json({ error: 'Failed to create refund request' }, { status: 400 });
  }

  return NextResponse.json({ refundRequest: serializeTicket(refundRequest) }, { status: 201 });
}
