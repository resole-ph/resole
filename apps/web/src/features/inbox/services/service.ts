import { db } from '@/config/db';
import { and, or, ne, asc, avg, count, desc, eq, getTableColumns, inArray, isNull } from 'drizzle-orm';
import { conversation, message, rating, sale, shoeListing, swap, swapItem, transaction, user } from '@/db/schema';
import { Conversation, CreateConversation, Message, CreateMessage } from '../types/types';
import { alias } from 'drizzle-orm/pg-core';

export async function createConversation(data: CreateConversation) {
  try {
    const result = await db
      .insert(conversation)
      .values(data)
      .returning();

    return result[0] as Conversation ?? null;
  } catch (error) {
    console.error("Error creating conversation.", error);
    return null;
  }
}

export async function createMessage(data: CreateMessage) {
  try {
    const result = await db
      .insert(message)
      .values(data)
      .returning();

    await db

    return result[0] as Message ?? null;
  } catch (error) {
    console.error("Error creating message.", error);
    return null;
  }
}

export async function getConversations() {
  try {
    const rows = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(conversation)
      })
      .from(conversation)
      .innerJoin(transaction, eq(conversation.transactionId, transaction.id))

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching conversations.", error);
    return null;
  }
}

export async function getConversationById(id: number) {
  try {
    const result = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(conversation)
      })
      .from(conversation)
      .innerJoin(transaction, eq(conversation.transactionId, transaction.id))
      .where(eq(conversation.id, id))

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching conversation.", error);
    return null;
  }
}

export async function getConversationBetweenUsers(userAId: string, userBId: string) {
  try {
    const result = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(conversation)
      })
      .from(conversation)
      .innerJoin(transaction, eq(conversation.transactionId, transaction.id))
      .where(
        or(
          and(eq(conversation.listerId, userAId), eq(conversation.recipientId, userBId)),
          and(eq(conversation.listerId, userBId), eq(conversation.recipientId, userAId))
        )
      )
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching conversation between users.", error);
    return null;
  }
}

/**
 * The seller's thread with this buyer, created if the two have never spoken.
 *
 * Called when an offer is made so the seller has somewhere to open from their
 * listing page whichever client it came from. Mobile still posts its own message
 * afterwards; that reuses this thread rather than opening a second one.
 */
export async function ensureOfferConversation(data: CreateConversation) {
  const existing = await getConversationBetweenUsers(data.listerId, data.recipientId);
  if (existing) return existing;

  return createConversation(data);
}

export async function getOfferConversationForListing(userId: string, listingId: number) {
  try {
    const result = await db
      .select({
        transactionId: transaction.id,
        type: transaction.type,
        conversationId: conversation.id,
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .innerJoin(
        conversation,
        or(
          and(
            eq(conversation.listerId, shoeListing.userId),
            eq(conversation.recipientId, userId),
          ),
          and(
            eq(conversation.listerId, userId),
            eq(conversation.recipientId, shoeListing.userId),
          ),
        ),
      )
      .where(
        and(
          eq(transaction.listingId, listingId),
          eq(transaction.recipientId, userId),
          ne(transaction.isAccepted, false)
        ),
      )
      .orderBy(desc(transaction.createdAt))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.error('Error fetching offer conversation for listing.', error);
    return null;
  }
}

/**
 * Every offer made on one listing, from the seller's side, each already paired
 * with the conversation it lives in.
 *
 * The buyer-facing `getOfferConversationForListing` answers "do I already have
 * an offer here"; this answers "who has offered on my shoe", so the seller can
 * open the right thread without hunting through the inbox for a name they may
 * not recognise. Callers MUST check listing ownership first — this query does
 * not, and the rows expose who is interested in a listing.
 *
 * Conversations are matched on `transactionId` rather than the participant pair,
 * so two offers from the same buyer stay on their own threads.
 */
export async function getListingOffers(listingId: number) {
  try {
    const buyerRating = db
      .select({
        rateeId: rating.rateeId,
        average: avg(rating.rating).as('average'),
      })
      .from(rating)
      .where(isNull(rating.deletedAt))
      .groupBy(rating.rateeId)
      .as('buyer_rating');

    const rows = await db
      .select({
        transactionId: transaction.id,
        conversationId: conversation.id,
        type: transaction.type,
        isAccepted: transaction.isAccepted,
        isCompleted: transaction.isCompleted,
        createdAt: transaction.createdAt,
        // Only sale offers have a price row; a swap offer's value is its items.
        price: sale.price,
        // `user.image` is deliberately not selected: avatars are stored as base64
        // data URIs, so a handful of offers would push this response into the
        // megabytes over a phone connection. The rows render initial avatars.
        buyer: {
          id: user.id,
          name: user.name,
          city: user.city,
          address: user.address,
          rating: buyerRating.average,
        },
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(shoeListing.id, transaction.listingId))
      .innerJoin(user, eq(transaction.recipientId, user.id))
      // Matched on the seller-buyer pair, not on `conversation.transactionId`:
      // one thread is kept per pair and that column is stamped from whichever
      // offer opened it, so joining on it dropped every repeat offer. Left, since
      // the thread only powers the "open chat" link.
      .leftJoin(
        conversation,
        or(
          and(
            eq(conversation.listerId, shoeListing.userId),
            eq(conversation.recipientId, transaction.recipientId),
          ),
          and(
            eq(conversation.listerId, transaction.recipientId),
            eq(conversation.recipientId, shoeListing.userId),
          ),
        ),
      )
      .leftJoin(sale, eq(sale.transactionId, transaction.id))
      .leftJoin(buyerRating, eq(buyerRating.rateeId, user.id))
      .where(eq(transaction.listingId, listingId))
      .orderBy(desc(transaction.createdAt));

    // A pair should only ever hold one thread, but two offers racing could open a
    // second and the join would then list the offer twice.
    const offerRows = Array.from(
      new Map(rows.map((row) => [row.transactionId, row])).values()
    );

    // What a swapper put up in exchange. Fetched in one grouped pass rather than
    // per offer, and left out entirely when no swap offers came back.
    const swapTransactionIds = offerRows
      .filter((row) => row.type === 'swap')
      .map((row) => row.transactionId);

    const swapItemCounts = swapTransactionIds.length
      ? await db
          .select({
            transactionId: swap.transactionId,
            itemCount: count(swapItem.id),
          })
          .from(swap)
          .innerJoin(swapItem, eq(swapItem.swapId, swap.id))
          .where(inArray(swap.transactionId, swapTransactionIds))
          .groupBy(swap.transactionId)
      : [];

    const itemCountByTransaction = new Map(
      swapItemCounts.map((row) => [row.transactionId, Number(row.itemCount)])
    );

    return offerRows.map((row) => ({
      transactionId: row.transactionId,
      conversationId: row.conversationId,
      type: row.type,
      isAccepted: row.isAccepted,
      isCompleted: row.isCompleted,
      createdAt: row.createdAt.toISOString(),
      price: row.price != null ? Number(row.price) : null,
      swapItemCount: itemCountByTransaction.get(row.transactionId) ?? 0,
      buyer: {
        id: row.buyer.id,
        name: row.buyer.name,
        location: row.buyer.city || row.buyer.address || null,
        rating: row.buyer.rating != null ? Number(row.buyer.rating) : null,
      },
    }));
  } catch (error) {
    console.error('Error fetching offers for listing.', error);
    return null;
  }
}

export async function getUserConversations(id: string) {
  try {
    const otherUser = alias(user, 'otherUser');

    const latestMessageSq = db.$with('latest_message_sq').as(
      db.selectDistinctOn([message.conversationId])
        .from(message)
        .orderBy(message.conversationId, desc(message.createdAt))
    );

    const rows = await db
      .with(latestMessageSq)
      .select({
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        user: getTableColumns(otherUser),
        transaction: getTableColumns(transaction),
        latestMessage: {
          id: latestMessageSq.id,
          conversationId: latestMessageSq.conversationId,
          senderId: latestMessageSq.userId,
          recipientId: latestMessageSq.replyTo,
          content: latestMessageSq.content,
          attachment: latestMessageSq.attachment,
          isEdited: latestMessageSq.isEdited,
          createdAt: latestMessageSq.createdAt,
          deletedAt: latestMessageSq.deletedAt
        }
      })
      .from(conversation)
      .innerJoin(
        otherUser,
        or(
          and(
            eq(conversation.listerId, id),
            eq(conversation.recipientId, otherUser.id)
          ),
          and(
            eq(conversation.recipientId, id),
            eq(conversation.listerId, otherUser.id)
          )
        )
      )
      .innerJoin(transaction, eq(conversation.transactionId, transaction.id))
      .leftJoin(latestMessageSq, eq(conversation.id, latestMessageSq.conversationId))
      .where(
        or(
          eq(conversation.listerId, id),
          eq(conversation.recipientId, id)
        )
      )
      .orderBy(desc(latestMessageSq.createdAt))

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching user conversations.", error);
    return null;
  }
}

export async function getConversationMessages(id: number) {
  try {
    const result = await db
      .select()
      .from(message)
      .where(
        and(
          eq(message.conversationId, id),
          isNull(message.deletedAt)
        )
      )
      .orderBy(asc(message.createdAt))

    return result as Message[] ?? null;
  } catch (error) {
    console.error("Error fetching messages.", error);
    return null;
  }
}

export async function updateMessage(id: number, content: string) {
  try {
    const result = await db
      .update(message)
      .set({
        content: content,
        isEdited: true
      })
      .where(eq(message.id, id))
      .returning()

    return result[0] as Message ?? null;
  } catch (error) {
    console.error("Error updating message.", error);
    return null;
  }
}

export async function deleteMessage(id: number) {
  try {
    await db
      .delete(message)
      .where(eq(message.id, id))

    return "Message successfully deleted.";
  } catch (error) {
    console.error("Error deleting message.", error);
    return null;
  }
}
