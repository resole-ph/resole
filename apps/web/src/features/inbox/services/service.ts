import { db } from '@/config/db';
import { and, or, asc, desc, eq, getTableColumns, isNull } from 'drizzle-orm';
import { conversation, message, transaction, user } from '@/db/schema';
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