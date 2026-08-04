import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getConversationById, getConversationMessages } from '@/features/inbox/services/service';
import { getTransactionsWithDetailsByIds } from '@/features/transaction/services/service';
import { getRatedTransactions } from '@/features/user-action/services/service';
import { getShoeListingsByIds } from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';
import { parsePositiveInt } from '@/lib/id';

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const conversationId = parsePositiveInt(id);
  if (!conversationId) {
    return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 });
  }

  // Every await here is a round trip to a remote database, so anything that does
  // not depend on an earlier result is issued at the same time. The messages are
  // fetched before the caller is known to be a participant — they are discarded
  // unread if the access check below fails.
  const [currentUser, conversation, messages] = await Promise.all([
    getAuthenticatedUser(request),
    getConversationById(conversationId),
    getConversationMessages(conversationId),
  ]);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const isLister = currentUser.user.id === conversation.listerId;
  const isRecipient = currentUser.user.id === conversation.recipientId;
  if (!isLister && !isRecipient) {
    return NextResponse.json({ error: 'Denied access' }, { status: 401 });
  }

  if (!messages) {
    return NextResponse.json({ error: 'Messages not found' }, { status: 404 });
  }

  const transactionIds = Array.from(
    new Set(messages.map((m) => m.transactionId).filter((tid): tid is number => tid != null))
  );

  const [transactions, ratedTransactions] = await Promise.all([
    getTransactionsWithDetailsByIds(transactionIds),
    getRatedTransactions(transactionIds),
  ]);

  const ratedTransactionSet = new Set(
    // A rating row has its own primary key. Match against the offer/transaction
    // id so this status is scoped to the current participant's rating.
    ratedTransactions.map((item) => `${item.transactionId}-${item.raterRole}`)
  );

  const offers = transactions.map((transaction) => {
    const role = currentUser.user.id === transaction.listing.userId ? 'seller' : 'recipient';
    
    return {
      ...transaction,
      isRated: ratedTransactionSet.has(`${transaction.id}-${role}`),
    };
  });

  // Offer cards render the listing being offered on, and for a swap the item put
  // up in exchange. Both are resolved here: left to the client they become one
  // request per listing, each of which cannot even start until this response
  // lands. A thread usually points at only a couple of distinct listings, so this
  // is a single extra query rather than a second round of network calls.
  const listingIds = Array.from(
    new Set(
      offers.flatMap((offer) => [
        offer.listingId,
        ...(offer.details && 'items' in offer.details
          ? offer.details.items.map((item) => item.itemId)
          : []),
      ])
    )
  ).filter((listingId): listingId is number => listingId != null);

  const listings = await getShoeListingsByIds(listingIds);
  const listingById = new Map(
    listings.map((listing) => [listing.id, serializeShoeListing(listing)])
  );

  const offerExtras = Object.fromEntries(
    offers.map((offer) => {
      const swapItemId =
        offer.details && 'items' in offer.details ? offer.details.items[0]?.itemId : null;

      return [
        offer.id,
        {
          listing: listingById.get(offer.listingId) ?? null,
          swapItem: swapItemId != null ? listingById.get(swapItemId) ?? null : null,
        },
      ];
    })
  );

  return NextResponse.json({
    messages: messages,
    offers: offers,
    offerExtras: offerExtras
  });
}
