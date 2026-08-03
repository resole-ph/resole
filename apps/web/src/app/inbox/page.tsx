import InboxView from '@/features/inbox/components/InboxView';
import { getAuthenticatedUserFromCookies } from '@/lib/request-auth';
import { getInboxItemsForUser } from '@/features/inbox/services/inbox.server';

/**
 * The conversation list is fetched here rather than in a browser effect, so the
 * HTML already carries it. Left to the client, the first request could not even
 * be sent until the page bundle had downloaded and hydrated.
 */
export default async function InboxPage() {
  const currentUser = await getAuthenticatedUserFromCookies();

  // Signed out, or the cookie no longer resolves: render the shell and let the
  // client handle it exactly as before.
  if (!currentUser) {
    return <InboxView />;
  }

  const conversations = await getInboxItemsForUser(currentUser.user.id);

  return <InboxView initialConversations={conversations} initialUserId={currentUser.user.id} />;
}
