import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserConversations, createConversation, createMessage } from '@/features/inbox/services/service';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const conversationPayload = {
    recipientId: currentUser.user.id,
    listerId: body.listerId,
    transactionId: body.transactionId
  }

  body['recipientId'] = currentUser.user.id;
  body['userId'] = currentUser.user.id;

  const conversation = await createConversation(conversationPayload);
  if (!conversation) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 400 });
  }

  const messagePayload = {
    userId: currentUser.user.id,
    conversationId: conversation.id,
    content: body.content
  }

  const message = await createMessage(messagePayload);
  if (!message) {
    return NextResponse.json({ error: 'Failed to message lister' }, { status: 500 });
  }

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