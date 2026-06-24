import { db } from '@/config/db';
import { eq, desc, getTableColumns } from 'drizzle-orm';
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
  Transaction,
  TrackingEvent,
  Sale,
  Swap,
  Donation,
  Redemption,
  SwapItem,
  Voucher } from '@/features/transaction/types/types';
import { Charity } from '@/features/charity/types/types';
import { Shoe, ShoeListing } from '@/features/shoe/types/types';

export async function getAllTransactions() {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        recipient: getTableColumns(user),
        ...getTableColumns(transaction)
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .innerJoin(user, eq(transaction.recipientId, user.id));

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching transactions.", error);
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
      .innerJoin(user, eq(transaction.recipientId, user.id))
      .where(eq(transaction.id, id));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching transactions.", error);
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

