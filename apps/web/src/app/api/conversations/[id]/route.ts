import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getConversationById, getConversationMessages } from '@/features/inbox/services/service';
import { getTransactionById, getTransactionDetails } from '@/features/transaction/services/service';
import { checkIfTransactionIsRated } from '@/features/user-action/services/service'; 

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

  const transactionIds = Array.from(
    new Set(messages.map((m) => m.transactionId).filter((tid): tid is number => tid != null))
  );

  const offers = (
    await Promise.all(
      transactionIds.map(async (transactionId) => {
        const transaction = await getTransactionById(transactionId);
        if (!transaction) return null;
        
        const details = await getTransactionDetails(transaction);
        if (!details) return null;

        const isRated = await checkIfTransactionIsRated(transactionId);

        return {
          ...details,
          isRated,
        };
      })
    )
  ).filter((offer): offer is NonNullable<typeof offer> => offer != null);

  return NextResponse.json({
    messages: messages,
    offers: offers
  });
}