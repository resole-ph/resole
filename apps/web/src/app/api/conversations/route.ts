import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserConversations, getConversationBetweenUsers, createConversation, createMessage } from '@/features/inbox/services/service';
import { getTransactionById } from '@/features/transaction/services/service';
import { createNotification } from '@/features/notifications/services/service';

const OFFER_NOTIFICATION_TITLES: Record<string, string> = {
  sale: 'New offer received',
  swap: 'New swap offer received',
  donate: 'New donation update',
};

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.listerId === currentUser.user.id) {
    return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
  }

  // Two users only ever get one thread between them — later offers to the same
  // person are appended as new (offer-tagged) messages on that same conversation
  // instead of spawning a duplicate thread per transaction.
  const existingConversation = await getConversationBetweenUsers(currentUser.user.id, body.listerId);

  const conversation = existingConversation ?? await createConversation({
    recipientId: currentUser.user.id,
    listerId: body.listerId,
    transactionId: body.transactionId,
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 400 });
  }

  const messagePayload = {
    userId: currentUser.user.id,
    conversationId: conversation.id,
    transactionId: body.transactionId,
    content: body.content
  }

  const message = await createMessage(messagePayload);
  if (!message) {
    return NextResponse.json({ error: 'Failed to message lister' }, { status: 500 });
  }

  const transaction = await getTransactionById(body.transactionId);
  await createNotification({
    userId: body.listerId,
    category: 'offer',
    title: (transaction && OFFER_NOTIFICATION_TITLES[transaction.type]) ?? 'New offer received',
    body: body.content?.slice(0, 200) || 'You have a new message about your listing.',
    actionUrl: `/inbox/o${conversation.id}`,
    entityType: 'conversation',
    entityId: String(conversation.id),
  });

  return NextResponse.json({
    conversation: conversation,
    message: message
  });
}

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await getUserConversations(currentUser.user.id);

  if (!conversations) {
    return NextResponse.json({ error: 'Unable to fetch conversations' }, { status: 500 });
  }

  return NextResponse.json({
    conversations: conversations
  });
}