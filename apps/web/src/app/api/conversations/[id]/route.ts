import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getConversationById, getConversationMessages } from '@/features/inbox/services/service';
import { getTransactionDetails } from '@/features/transaction/services/service';

function parseConversationId(rawId: string) {
  const conversationId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return null;
  }

  return conversationId;
}

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const conversationId = parseConversationId(id);
  if (!conversationId) {
    return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const isLister = currentUser.user.id === conversation.listerId;
  const isRecipient = currentUser.user.id === conversation.recipientId;
  if (!isLister && !isRecipient) {
    return NextResponse.json({ error: 'Denied access' }, { status: 401 });
  }

  const messages = await getConversationMessages(conversation.id);
  if (!messages) {
    return NextResponse.json({ error: 'Messages not found' }, { status: 404 });
  }

  const offer = await getTransactionDetails(conversation.transaction);
  if (!offer) {
    return NextResponse.json({ error: 'Conversation transaction not found' }, { status: 404 });
  }

  return NextResponse.json({
    messages: messages,
    offer: offer
  })
}