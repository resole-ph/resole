import { db } from '@/config/db';
import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
import { ticket, user } from '@/db/schema';
import { Ticket, CreateTicket, UpdateTicket } from '@/features/ticket/types/types';

const ACTIVE_TRANSACTION_TICKET_STATUSES = ['open', 'in_progress'] as const;

export async function createTicket(data: CreateTicket) {
  try {
    const result = await db
      .insert(ticket)
      .values(data)
      .returning();

    return getTicketById(result[0].id);
  } catch (error) {
    console.error("Error creating ticket.", error);
    return null;
  }
}

export async function getActiveTransactionTicket(transactionId: number, issue: string) {
  try {
    const rows = await db
      .select()
      .from(ticket)
      .where(
        and(
          eq(ticket.transactionId, transactionId),
          eq(ticket.issue, issue),
          inArray(ticket.status, ACTIVE_TRANSACTION_TICKET_STATUSES)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error("Error fetching active transaction ticket.", error);
    return null;
  }
}

export async function getAllTicket() {
  try {
    const rows = await db
      .select({
        user: getTableColumns(user),
        ...getTableColumns(ticket)
      })
      .from(ticket);
    
    return rows as Ticket[] ?? null;
  } catch (error) {
    console.error("Error fetching tickets.", error);
    return null;
  }
}

export async function getTicketById(id: string) {
  try {
    const rows = await db
      .select({
        user: getTableColumns(user),
        ...getTableColumns(ticket)
      })
      .from(ticket)
      .where(eq(ticket.id, id));
    
    return rows[0] as Ticket ?? null;
  } catch (error) {
    console.error("Error fetching ticket.", error);
    return null;
  }
}

export async function updateTicket(data: UpdateTicket, id: string) {
  try {
    const result = await db 
      .update(ticket)
      .set(data)
      .where(eq(ticket.id, id))
      .returning({ id: ticket.id });

    return getTicketById(result[0].id);
  } catch (error) {
    console.error("Error updating ticket.", error);
    return null
  }
}

export async function deleteTicket(id: string) {
  try {
    await db 
      .delete(ticket)
      .where(eq(ticket.id, id))

    return "Ticket successfully deleted.";
  } catch (error) {
    console.error("Error deleting ticket.", error);
    return null
  }
}
