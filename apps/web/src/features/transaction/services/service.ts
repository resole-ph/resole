import { db } from '@/config/db';
import { eq, or, sql, desc, aliasedTable, getTableColumns } from 'drizzle-orm';
import { 
  transaction,  
  sale,
  swap,
  donation,
  redemption,
  swapItem,
  charity,
  voucher, 
  user,
  shoe,
  shoeListing,
  trackingEvent
} from '@/db/schema';
import { 
  Voucher } from '@/features/transaction/types/types';

async function getTransactionDetails(transaction: any) {
  if (!transaction.id || !transaction.type) return;

  let details;
  switch (transaction.type) {
    case 'sale':
      details = await getSaleById(transaction.id);
      break;
    case 'swap':
      details = await getSwapById(transaction.id);
      break;
    case 'donation':
      details = await getDonationById(transaction.id);
      break;
    default:
      details = null;
  }

  if (details && typeof details === 'object' && 'transaction' in details) {
    delete (details as any).transaction;
  }

  return {
    details: details,
    ...transaction
  };
}

export async function getAllTransaction() {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        recipient: getTableColumns(user),
        ...getTableColumns(transaction)
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .leftJoin(user, eq(transaction.recipientId, user.id));

    return rows.map(item => getTransactionDetails(item)) ?? null;
  } catch (error) {
    console.error("Error fetching transactions.", error);
    return null;
  }
}

export async function getAllSale() {
  try {
    const rows = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(sale)
      })
      .from(sale)
      .innerJoin(transaction, eq(sale.transactionId, transaction.id))

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching sale transactions.", error);
    return null;
  }
}

export async function getAllSwap() {
  try {
    const rows = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(swap)
      })
      .from(swap)
      .innerJoin(transaction, eq(swap.transactionId, transaction.id))

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching swap transactions.", error);
    return null;
  }
}

export async function getAllDonation() {
  try {
    const rows = await db
      .select({
        transaction: getTableColumns(transaction),
        charity: getTableColumns(charity),
        ...getTableColumns(donation)
      })
      .from(donation)
      .innerJoin(transaction, eq(donation.transactionId, transaction.id))
      .innerJoin(charity, eq(donation.charityId, charity.id));

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching donation transactions.", error);
    return null;
  }
}

export async function getAllVoucher() {
  try {
    const rows = await db
      .select()
      .from(voucher);
    
    return rows as Voucher[] ?? null;
  } catch (error) {
    console.error("Error fetching vouchers.", error);
    return null;
  }
}

export async function getTransactionById(id: number) {
  try {
    const result = await db
      .select({
        listing: getTableColumns(shoeListing),
        recipient: getTableColumns(user),
        ...getTableColumns(transaction)
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .leftJoin(user, eq(transaction.recipientId, user.id))
      .where(eq(transaction.id, id));

    return getTransactionDetails(result[0]) ?? null;
  } catch (error) {
    console.error("Error fetching transactions.", error);
    return null;
  }
}

export async function getAllUserTransactions(userId: string) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        recipient: getTableColumns(user),
        isOwner: sql<boolean>`${shoeListing.userId} = ${userId}`, 
        ...getTableColumns(transaction),
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .leftJoin(user, eq(transaction.recipientId, user.id))
      .where(
        or(
          eq(transaction.recipientId, userId), 
          eq(shoeListing.userId, userId)
        )
      );

    return rows.map(item => getTransactionDetails(item)) ?? null;
  } catch (error) {
    console.error("Error fetching user transactions.", error);
    return null;
  }
}

export async function getSaleById(id: number) {
  try {
    const result = await db
      .select({
        transaction: getTableColumns(transaction),
        redemption: getTableColumns(redemption),
        ...getTableColumns(sale)
      })
      .from(sale)
      .innerJoin(transaction, eq(sale.transactionId, transaction.id))
      .innerJoin(redemption, eq(sale.id, redemption.saleId))
      .where(eq(sale.id, id));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching sale transaction.", error);
    return null;
  }
}

export async function getSwapById(id: number) {
  try {
    const result = await db
      .select({
        transaction: getTableColumns(transaction),
        ...getTableColumns(swap)
      })
      .from(swap)
      .innerJoin(transaction, eq(swap.transactionId, transaction.id))
      .where(eq(swap.id, id));
    
    const items = await db
      .select({
        item: getTableColumns(shoeListing),
        ...getTableColumns(swapItem)
      })
      .from(swapItem)
      .where(eq(swapItem.swapId, id))
      .orderBy(desc(swapItem.createdAt));

    const swapResult = result[0] ?? null;
    if (swapResult) {
      (swapResult as any).items = items;
    }

    return swapResult ? { ...swapResult, items } : null;
  } catch (error) {
    console.error("Error fetching swap transaction.", error);
    return null;
  }
}

export async function getDonationById(id: number) {
  try {
    const result = await db
      .select({
        transaction: getTableColumns(transaction),
        charity: getTableColumns(charity),
        ...getTableColumns(donation)
      })
      .from(donation)
      .innerJoin(transaction, eq(donation.transactionId, transaction.id))
      .innerJoin(charity, eq(donation.charityId, charity.id))
      .where(eq(donation.id, id));

    return result ?? null;
  } catch (error) {
    console.error("Error fetching donation transaction.", error);
    return null;
  }
}

export async function getTransactionTrackingByTransactionId(id: number) {
  try {
    const timeline = await db
      .select({
        status: trackingEvent.status,
        message: trackingEvent.message,
        date: trackingEvent.createdAt,
      })
      .from(trackingEvent)
      .where(eq(trackingEvent.transactionId, id))
      .orderBy(desc(trackingEvent.createdAt));

    return timeline ?? null;
  } catch (error) {
    console.error("Error fetching transaction timeline.", error);
    return null;
  }
}

export async function getVoucherById(id: number) {
  try {
    const rows = await db
      .select()
      .from(voucher)
      .where(eq(voucher.id, id));
    
    return rows[0] as Voucher ?? null;
  } catch (error) {
    console.error("Error fetching voucher.", error);
    return null;
  }
}