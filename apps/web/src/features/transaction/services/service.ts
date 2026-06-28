import { db } from '@/config/db';
import { and, eq } from 'drizzle-orm';
import { voucher, cartItem, shoeListing, transaction as dbTransactionTable, sale } from '@/db/schema';
import { Voucher } from '@/features/transaction/types/types';

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
        .insert(dbTransactionTable)
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