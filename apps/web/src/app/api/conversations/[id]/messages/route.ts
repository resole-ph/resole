import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createMessage, getConversationById } from '@/features/inbox/services/service';
import { createNotification } from '@/features/notifications/services/service';
import { parsePositiveInt } from '@/lib/id';

export async function POST(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const conversationId = parsePositiveInt(id);
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

  const body = await request.json() as { content?: unknown };
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  const message = await createMessage({
    userId: currentUser.user.id,
    conversationId: conversation.id,
    content,
  });
  if (!message) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 400 })
  }

  const recipientOfNotification = isLister ? conversation.recipientId : conversation.listerId;
  await createNotification({
    userId: recipientOfNotification,
    category: 'offer',
    title: 'New message',
    body: content.slice(0, 200),
    actionUrl: `/inbox/o${conversation.id}`,
    entityType: 'conversation',
    entityId: String(conversation.id),
  });

  return NextResponse.json({
    message: message
  })
}
