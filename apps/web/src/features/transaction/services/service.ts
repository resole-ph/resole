import { db } from '@/config/db';
import { eq, and, or, sql, desc, aliasedTable, getTableColumns } from 'drizzle-orm';
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
  trackingEvent,
  cartItem
} from '@/db/schema';
import { 
  CreateTransaction, 
  Voucher 
} from '@/features/transaction/types/types';
import { ShoeListing } from '@/features/shoe/types/types';

export async function getTransactionDetails(transaction: any) {
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

export async function createTransaction(data: CreateTransaction) {
  try {
    const result = await db
      .insert(transaction)
      .values(data)
      .returning({ id: transaction.id });
    
    return getTransactionById(result[0].id) ?? null;
  } catch (error) {
    console.error("Error creating transaction.", error);
    return null;
  }
}

export async function createSale(transactionId: number, price: number) {
  try {
    const result = await db
      .insert(sale)
      .values({
        transactionId: transactionId,
        price: price.toString()
      })
      .returning({ id: sale.id });
    
    return getSaleById(result[0].id) ?? null;
  } catch (error) {
    console.error("Error creating sale.", error);
    return null;
  }
}

export async function createSwap(transactionId: number, listings: ShoeListing[]) {
  try {
    const result = await db
      .insert(swap)
      .values({
        transactionId: transactionId,
      })
      .returning({ id: sale.id });
    
    for (const listing of listings) {
      await db
        .insert(swapItem)
        .values({
          swapId: result[0].id,
          itemId: listing.id
        })
    }

    return getSwapById(result[0].id) ?? null;
  } catch (error) {
    console.error("Error creating sale.", error);
    return null;
  }
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

    return rows ?? null;
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
      .leftJoin(redemption, eq(sale.id, redemption.saleId))

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

    return result[0] ?? null;
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

    return rows ?? null;
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
      .leftJoin(redemption, eq(sale.id, redemption.saleId))
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

    return swapResult ? { items, ...swapResult } : null;
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

export async function acceptOffer(id: number) {
  try {
    const result = await db 
      .update(transaction)
      .set({ 
        isAccepted: true,
        acceptedAt: new Date() 
      })
      .where(eq(transaction.id, id))
      .returning({ id: transaction.id });

    return getTransactionById(result[0].id) ?? null;
  } catch (error) {
    console.error("Error accepting offer.", error);
    return null
  }
}

export async function declineOffer(id: number) {
  try {
    const result = await db 
      .update(transaction)
      .set({ 
        isAccepted: false,
        acceptedAt: null 
      })
      .where(eq(transaction.id, id))
      .returning({ id: transaction.id });

    return getTransactionById(result[0].id) ?? null;
  } catch (error) {
    console.error("Error declining offer.", error);
    return null
  }
}   
  
export async function checkoutCart(userId: string, isBuyNow: boolean) {
  const items = await db
    .select({
      cartItemId: cartItem.id,
      quantity: cartItem.quantity,
      listingId: shoeListing.id,
      value: shoeListing.value,
      isAvailable: shoeListing.isAvailable,
      sellerId: shoeListing.userId,
    })
    .from(cartItem)
    .innerJoin(shoeListing, eq(cartItem.listingId, shoeListing.id))
    .where(
      and(
        eq(cartItem.userId, userId),
        eq(cartItem.isBuyNow, isBuyNow)
      )
    );

  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  for (const item of items) {
    if (!item.isAvailable) {
      throw new Error(`Shoe listing ${item.listingId} is no longer available`);
    }
    if (item.sellerId === userId) {
      throw new Error('You cannot purchase your own shoe listing');
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (Number.parseFloat(item.value) * item.quantity), 0);

  const transactionResults = await db.transaction(async (tx) => {
    const results = [];

    for (const item of items) {
      const currentListings = await tx
        .select()
        .from(shoeListing)
        .where(eq(shoeListing.id, item.listingId))
        .limit(1);

      if (currentListings.length === 0 || !currentListings[0].isAvailable) {
        throw new Error(`Shoe listing ${item.listingId} is no longer available`);
      }

      const calculatedCoins = Math.max(1, Math.floor(Number.parseFloat(item.value) * 0.05));

      const [txRecord] = await tx
        .insert(transaction)
        .values({
          listingId: item.listingId,
          recipientId: userId,
          type: 'sale',
          isCompleted: true,
          coinsEarned: calculatedCoins,
        })
        .returning();

      const [saleRecord] = await tx
        .insert(sale)
        .values({
          transactionId: txRecord.id,
          price: item.value,
        })
        .returning();

      await tx
        .update(shoeListing)
        .set({
          isAvailable: false,
          updatedAt: new Date(),
        })
        .where(eq(shoeListing.id, item.listingId));

      await tx
        .delete(cartItem)
        .where(eq(cartItem.id, item.cartItemId));

      results.push({
        transactionId: txRecord.id,
        saleId: saleRecord.id,
        listingId: item.listingId,
        price: item.value,
        coinsEarned: calculatedCoins,
      });
    }

    return results;
  });

  return {
    total: subtotal,
    transactions: transactionResults,
  };
}
