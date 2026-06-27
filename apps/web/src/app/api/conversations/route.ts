import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserConversations } from '@/features/inbox/services/service';

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