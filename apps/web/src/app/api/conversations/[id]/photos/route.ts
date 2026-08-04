import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { parsePositiveInt } from '@/lib/id';
import { createMessage, getConversationById } from '@/features/inbox/services/service';
import {
  createInboxPhotoSignedUrl,
  deleteInboxPhoto,
  uploadInboxPhoto,
} from '@/features/inbox/services/inbox-photo-storage';
import { createNotification } from '@/features/notifications/services/service';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
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
    return NextResponse.json({ error: 'Denied access' }, { status: 403 });
  }

  let attachment = null;
  let messageSaved = false;
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
    }

    attachment = await uploadInboxPhoto(photo, conversation.id, currentUser.user.id);
    const message = await createMessage({
      userId: currentUser.user.id,
      conversationId: conversation.id,
      content: '',
      attachment,
    });

    if (!message) {
      await deleteInboxPhoto(attachment.path);
      return NextResponse.json({ error: 'Failed to save photo message' }, { status: 500 });
    }
    messageSaved = true;

    const recipientId = isLister ? conversation.recipientId : conversation.listerId;
    await createNotification({
      userId: recipientId,
      category: 'offer',
      title: 'New photo',
      body: 'Sent you a photo.',
      actionUrl: `/inbox/o${conversation.id}`,
      entityType: 'conversation',
      entityId: String(conversation.id),
    });

    const url = await createInboxPhotoSignedUrl(attachment.path).catch(() => null);
    return NextResponse.json({
      message: { ...message, attachment: { ...attachment, url } },
    });
  } catch (error) {
    if (attachment && !messageSaved) {
      await deleteInboxPhoto(attachment.path);
    }
    console.error('Failed to send inbox photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not send the photo.' },
      { status: 400 },
    );
  }
}
