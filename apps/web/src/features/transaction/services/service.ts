import { db } from '@/config/db';
import { eq, and, or, sql, desc, getTableColumns, gt, gte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { 
  transaction,  
  sale,
  swap,
  donation,
  redemption,
  swapItem,
  charity,
  voucher, 
  voucherRedeem,
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

function getVoucherCoinCost(voucherAmount: string | null): number | null {
  if (!voucherAmount) {
    return null;
  }

  const coinCost = Number.parseInt(voucherAmount, 10);
  return Number.isFinite(coinCost) && coinCost > 0 ? coinCost : null;
}

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

export async function createSwap(transactionId: number, listings: number[]) {
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
          itemId: listing
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

function getTransactionStatus(row: { isAccepted: boolean | null; isCompleted: boolean }) {
  if (row.isCompleted) {
    return 'completed';
  }

  if (row.isAccepted === true) {
    return 'accepted';
  }

  if (row.isAccepted === false) {
    return 'declined';
  }

  return 'pending';
}

export async function getUserTransactionHistory(userId: string) {
  try {
    const listingOwner = alias(user, 'listingOwner');

    const rows = await db
      .select({
        id: transaction.id,
        type: transaction.type,
        isAccepted: transaction.isAccepted,
        isCompleted: transaction.isCompleted,
        coinsEarned: transaction.coinsEarned,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        acceptedAt: transaction.acceptedAt,
        completedAt: transaction.completedAt,
        amount: sql<string | null>`coalesce(${sale.price}, ${shoeListing.value})`,
        listingId: shoeListing.id,
        listingColorway: shoeListing.colorway,
        listingSize: shoeListing.size,
        listingConditionScore: shoeListing.conditionScore,
        listingValue: shoeListing.value,
        listingMode: shoeListing.listingMode,
        listingIsAvailable: shoeListing.isAvailable,
        listingImageUrlTop: shoeListing.imageUrlTop,
        listingImageUrlLeftSide: shoeListing.imageUrlLeftSide,
        shoeId: shoe.id,
        shoeBrand: shoe.brand,
        shoeModel: shoe.model,
        shoeCategory: shoe.category,
        ownerId: listingOwner.id,
        ownerName: listingOwner.name,
        ownerImage: listingOwner.image,
        ownerCity: listingOwner.city,
        recipientId: user.id,
        recipientName: user.name,
        recipientImage: user.image,
        recipientCity: user.city,
        saleId: sale.id,
        salePrice: sale.price,
        swapId: swap.id,
        donationId: donation.id,
        charityId: charity.id,
        charityName: charity.name,
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(listingOwner, eq(shoeListing.userId, listingOwner.id))
      .leftJoin(user, eq(transaction.recipientId, user.id))
      .leftJoin(sale, eq(sale.transactionId, transaction.id))
      .leftJoin(swap, eq(swap.transactionId, transaction.id))
      .leftJoin(donation, eq(donation.transactionId, transaction.id))
      .leftJoin(charity, eq(donation.charityId, charity.id))
      .where(
        or(
          eq(transaction.recipientId, userId),
          eq(shoeListing.userId, userId)
        )
      )
      .orderBy(desc(transaction.createdAt));

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      status: getTransactionStatus(row),
      amount: row.amount,
      coinsEarned: row.coinsEarned,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      acceptedAt: row.acceptedAt,
      completedAt: row.completedAt,
      listing: {
        id: row.listingId,
        colorway: row.listingColorway,
        size: row.listingSize,
        conditionScore: row.listingConditionScore,
        value: row.listingValue,
        listingMode: row.listingMode,
        isAvailable: row.listingIsAvailable,
        imageUrlTop: row.listingImageUrlTop,
        imageUrlLeftSide: row.listingImageUrlLeftSide,
        shoe: {
          id: row.shoeId,
          brand: row.shoeBrand,
          model: row.shoeModel,
          category: row.shoeCategory,
        },
        owner: {
          id: row.ownerId,
          name: row.ownerName,
          image: row.ownerImage,
          city: row.ownerCity,
        },
      },
      relatedUser: row.ownerId === userId
        ? row.recipientId
          ? {
              id: row.recipientId,
              name: row.recipientName,
              image: row.recipientImage,
              city: row.recipientCity,
            }
          : null
        : {
            id: row.ownerId,
            name: row.ownerName,
            image: row.ownerImage,
            city: row.ownerCity,
          },
      details: {
        sale: row.saleId ? { id: row.saleId, price: row.salePrice } : null,
        swap: row.swapId ? { id: row.swapId } : null,
        donation: row.donationId
          ? {
              id: row.donationId,
              charity: row.charityId ? { id: row.charityId, name: row.charityName } : null,
            }
          : null,
      },
    }));
  } catch (error) {
    console.error("Error fetching user transaction history.", error);
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
      .innerJoin(shoeListing, eq(swapItem.itemId, shoeListing.id))
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
        isCompleted: true,
        acceptedAt: new Date(),
        completedAt: new Date() 
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

export async function donateShoeListing(userId: string, listingId: number, charityId: number) {
  return db.transaction(async (tx) => {
    const listings = await tx
      .select()
      .from(shoeListing)
      .where(and(eq(shoeListing.id, listingId), eq(shoeListing.userId, userId)))
      .limit(1);

    const listing = listings[0];
    if (!listing) {
      throw new Error('Shoe listing not found');
    }

    if (listing.deletedAt) {
      throw new Error('Shoe listing is deleted');
    }

    const charities = await tx
      .select({ id: charity.id })
      .from(charity)
      .where(and(eq(charity.id, charityId), sql`${charity.deletedAt} IS NULL`))
      .limit(1);

    if (!charities[0]) {
      throw new Error('Charity not found');
    }

    const existingDonations = await tx
      .select({ id: donation.id })
      .from(donation)
      .innerJoin(transaction, eq(donation.transactionId, transaction.id))
      .where(and(eq(transaction.listingId, listingId), eq(transaction.type, 'donate')))
      .limit(1);

    if (existingDonations[0]) {
      throw new Error('Shoe listing has already been donated');
    }

    const [transactionRecord] = await tx
      .insert(transaction)
      .values({
        listingId,
        type: 'donate',
        isCompleted: false
      })
      .returning();

    const [donationRecord] = await tx
      .insert(donation)
      .values({
        transactionId: transactionRecord.id,
        charityId
      })
      .returning();

    await tx
      .update(shoeListing)
      .set({
        isAvailable: false,
        updatedAt: new Date()
      })
      .where(eq(shoeListing.id, listingId));

    return {
      transaction: transactionRecord,
      donation: donationRecord
    };
  });
}

type DonationPickupInput = {
  listingId: number;
  charityId: number;
  pickupAddress: string;
  pickupDate: Date;
  contactNo?: string;
  notes?: string;
};

export async function scheduleDonationPickup(userId: string, data: DonationPickupInput) {
  return db.transaction(async (tx) => {
    const listings = await tx
      .select()
      .from(shoeListing)
      .where(and(eq(shoeListing.id, data.listingId), eq(shoeListing.userId, userId)))
      .limit(1);

    const listing = listings[0];
    if (!listing) {
      throw new Error('Shoe listing not found');
    }

    if (listing.deletedAt) {
      throw new Error('Shoe listing is deleted');
    }

    if (!listing.isAvailable) {
      throw new Error('Shoe listing is not eligible for donation pickup');
    }

    const charities = await tx
      .select({ id: charity.id })
      .from(charity)
      .where(and(eq(charity.id, data.charityId), sql`${charity.deletedAt} IS NULL`))
      .limit(1);

    if (!charities[0]) {
      throw new Error('Charity not found');
    }

    const [transactionRecord] = await tx
      .insert(transaction)
      .values({
        listingId: data.listingId,
        type: 'donate',
        isCompleted: false,
      })
      .returning();

    const [donationRecord] = await tx
      .insert(donation)
      .values({
        transactionId: transactionRecord.id,
        charityId: data.charityId,
      })
      .returning();

    const [pickupEvent] = await tx
      .insert(trackingEvent)
      .values({
        transactionId: transactionRecord.id,
        status: 'pickup_scheduled',
        message: JSON.stringify({
          pickupAddress: data.pickupAddress,
          pickupDate: data.pickupDate.toISOString(),
          contactNo: data.contactNo ?? null,
          notes: data.notes ?? null,
        }),
      })
      .returning();

    await tx
      .update(shoeListing)
      .set({
        isAvailable: false,
        updatedAt: new Date(),
      })
      .where(eq(shoeListing.id, data.listingId));

    return {
      transaction: transactionRecord,
      donation: donationRecord,
      pickup: pickupEvent,
    };
  });
}

export async function getWalletByUserId(userId: string) {
  try {
    const userRows = await db
      .select({
        id: user.id,
        coins: user.coins,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const currentUser = userRows[0];
    if (!currentUser) {
      return null;
    }

    const userVouchers = await db
      .select({
        id: voucherRedeem.id,
        redeemedAt: voucherRedeem.redeemedAt,
        voucher: {
          id: voucher.id,
          name: voucher.name,
          description: voucher.description,
          amount: voucher.amount,
          voucherType: voucher.voucherType,
          expiresAt: voucher.expiresAt,
        },
      })
      .from(voucherRedeem)
      .innerJoin(voucher, eq(voucherRedeem.voucherId, voucher.id))
      .where(eq(voucherRedeem.userId, userId))
      .orderBy(desc(voucherRedeem.redeemedAt));

    const earnedRows = await db
      .select({
        value: sql<number>`coalesce(sum(${transaction.coinsEarned}), 0)`,
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .where(
        and(
          or(eq(transaction.recipientId, userId), eq(shoeListing.userId, userId)),
          gt(transaction.coinsEarned, 0),
        ),
      );

    const saleRedeemedRows = await db
      .select({
        value: sql<number>`coalesce(sum(${redemption.coinsRedeemed}), 0)`,
      })
      .from(redemption)
      .innerJoin(sale, eq(redemption.saleId, sale.id))
      .innerJoin(transaction, eq(sale.transactionId, transaction.id))
      .where(eq(transaction.recipientId, userId));

    const voucherCoinsRedeemed = userVouchers.reduce((total, userVoucher) => {
      return total + (getVoucherCoinCost(userVoucher.voucher.amount) ?? 0);
    }, 0);

    return {
      coinBalance: currentUser.coins,
      vouchers: userVouchers.map((userVoucher) => ({
        ...userVoucher,
        voucher: {
          ...userVoucher.voucher,
          coinCost: getVoucherCoinCost(userVoucher.voucher.amount),
        },
      })),
      summary: {
        totalCoinsEarned: Number(earnedRows[0]?.value ?? 0),
        totalCoinsRedeemed: Number(saleRedeemedRows[0]?.value ?? 0) + voucherCoinsRedeemed,
        voucherCount: userVouchers.length,
      },
    };
  } catch (error) {
    console.error("Error fetching wallet.", error);
    return null;
  }
}

export async function getWalletTransactionsByUserId(userId: string) {
  try {
    const earnedTransactions = await db
      .select({
        id: transaction.id,
        type: transaction.type,
        coinsEarned: transaction.coinsEarned,
        createdAt: transaction.createdAt,
        isLister: sql<boolean>`${userId} = ${shoeListing.userId}`,
        listing: {
          id: shoeListing.id,
          brand: shoe.brand,
          model: shoe.model,
          colorway: shoeListing.colorway,
          value: shoeListing.value,
          userId: shoeListing.userId,
        },
      })
      .from(transaction)
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .where(
        and(
          or(eq(transaction.recipientId, userId), eq(shoeListing.userId, userId)),
          gt(transaction.coinsEarned, 0),
        ),
      );

    const saleRedemptions = await db
      .select({
        id: redemption.id,
        saleId: redemption.saleId,
        coinsRedeemed: redemption.coinsRedeemed,
        createdAt: redemption.createdAt,
        sale: {
          id: sale.id,
          price: sale.price,
          transactionId: sale.transactionId,
        },
        listing: {
          id: shoeListing.id,
          brand: shoe.brand,
          model: shoe.model,
          colorway: shoeListing.colorway,
          value: shoeListing.value,
          userId: shoeListing.userId,
        },
      })
      .from(redemption)
      .innerJoin(sale, eq(redemption.saleId, sale.id))
      .innerJoin(transaction, eq(sale.transactionId, transaction.id))
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .where(eq(transaction.recipientId, userId));

    const voucherRedemptions = await db
      .select({
        id: voucherRedeem.id,
        redeemedAt: voucherRedeem.redeemedAt,
        voucher: {
          id: voucher.id,
          name: voucher.name,
          description: voucher.description,
          amount: voucher.amount,
          voucherType: voucher.voucherType,
          expiresAt: voucher.expiresAt,
        },
      })
      .from(voucherRedeem)
      .innerJoin(voucher, eq(voucherRedeem.voucherId, voucher.id))
      .where(eq(voucherRedeem.userId, userId));

    const rows = [
      ...earnedTransactions.map((item) => ({
        id: `transaction-${item.id}`,
        sourceId: item.id,
        kind: 'earn' as const,
        type: item.type,
        amount: item.coinsEarned ?? 0,
        createdAt: item.createdAt,
        listing: item.listing,
      }))
      .filter(item => item.amount !== 0),
      ...saleRedemptions.map((item) => ({
        id: `redemption-${item.id}`,
        sourceId: item.id,
        kind: 'spend' as const,
        type: 'sale_redemption' as const,
        amount: -item.coinsRedeemed,
        createdAt: item.createdAt,
        redemption: {
          id: item.id,
          saleId: item.saleId,
          coinsRedeemed: item.coinsRedeemed,
          createdAt: item.createdAt,
        },
        sale: item.sale,
        listing: item.listing,
      })),
      ...voucherRedemptions
        .map((item) => ({
          id: `voucher-redeem-${item.id}`,
          sourceId: item.id,
          kind: 'spend' as const,
          type: 'voucher_redemption' as const,
          amount: -(getVoucherCoinCost(item.voucher.amount) ?? 0),
          createdAt: item.redeemedAt,
          voucher: {
            ...item.voucher,
            coinCost: getVoucherCoinCost(item.voucher.amount),
          },
        }))
        .filter((item) => item.amount < 0),
    ];

    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error fetching wallet transactions.", error);
    return null;
  }
}

export async function getActiveRedeemOptions() {
  try {
    const rows = await db
      .select({
        id: voucher.id,
        name: voucher.name,
        description: voucher.description,
        amount: voucher.amount,
        voucherType: voucher.voucherType,
        expiresAt: voucher.expiresAt,
      })
      .from(voucher)
      .where(gt(voucher.expiresAt, new Date()))
      .orderBy(
        desc(voucher.createdAt),
        desc(voucher.amount)
      );

    return rows.map((row) => ({
      ...row,
      type: 'voucher' as const,
      coinCost: getVoucherCoinCost(row.amount),
      isAvailable: row.expiresAt > new Date(),
    }));
  } catch (error) {
    console.error("Error fetching redeem options.", error);
    return null;
  }
}

export async function redeemSaleCoins(userId: string, saleId: number, coinsRedeemed: number) {
  if (coinsRedeemed <= 0) {
    throw new Error('Coins redeemed must be a positive number');
  }

  return db.transaction(async (tx) => {
    const saleRows = await tx
      .select({
        sale: getTableColumns(sale),
        transaction: getTableColumns(transaction),
      })
      .from(sale)
      .innerJoin(transaction, eq(sale.transactionId, transaction.id))
      .where(eq(sale.id, saleId))
      .limit(1);

    const saleRecord = saleRows[0];
    if (!saleRecord) {
      throw new Error('Redeem option not found');
    }

    if (saleRecord.transaction.recipientId !== userId) {
      throw new Error('Forbidden');
    }

    const [updatedUser] = await tx
      .update(user)
      .set({
        coins: sql`${user.coins} - ${coinsRedeemed}`,
        updatedAt: new Date(),
      })
      .where(and(eq(user.id, userId), gte(user.coins, coinsRedeemed)))
      .returning({ coinBalance: user.coins });

    if (!updatedUser) {
      throw new Error('Insufficient coin balance');
    }

    const [redemptionRecord] = await tx
      .insert(redemption)
      .values({
        saleId,
        coinsRedeemed,
      })
      .returning();

    return {
      redemption: redemptionRecord,
      coinBalance: updatedUser.coinBalance,
    };
  });
}

export async function redeemVoucher(userId: string, voucherId: number) {
  return db.transaction(async (tx) => {
    const voucherRows = await tx
      .select()
      .from(voucher)
      .where(and(eq(voucher.id, voucherId), gt(voucher.expiresAt, new Date())))
      .limit(1);

    const voucherRecord = voucherRows[0];
    if (!voucherRecord) {
      throw new Error('Redeem option not found');
    }

    const coinCost = getVoucherCoinCost(voucherRecord.amount);
    if (!coinCost) {
      throw new Error('Redeem option does not have a coin cost');
    }

    const existingRedemptions = await tx
      .select({ id: voucherRedeem.id })
      .from(voucherRedeem)
      .where(and(eq(voucherRedeem.userId, userId), eq(voucherRedeem.voucherId, voucherId)))
      .limit(1);

    if (existingRedemptions[0]) {
      throw new Error('Voucher already redeemed');
    }

    const [updatedUser] = await tx
      .update(user)
      .set({
        coins: sql`${user.coins} - ${coinCost}`,
        updatedAt: new Date(),
      })
      .where(and(eq(user.id, userId), gte(user.coins, coinCost)))
      .returning({ coinBalance: user.coins });

    if (!updatedUser) {
      throw new Error('Insufficient coin balance');
    }

    const [voucherRedemption] = await tx
      .insert(voucherRedeem)
      .values({
        voucherId,
        userId,
      })
      .returning();

    return {
      redemption: voucherRedemption,
      voucher: {
        id: voucherRecord.id,
        name: voucherRecord.name,
        description: voucherRecord.description,
        amount: voucherRecord.amount,
        voucherType: voucherRecord.voucherType,
        expiresAt: voucherRecord.expiresAt,
        coinCost,
      },
      coinBalance: updatedUser.coinBalance,
    };
  });
}
