import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { db } from '@/config/db';
import { and, eq } from 'drizzle-orm';
import { cartItem, shoeListing, transaction as dbTransactionTable, sale } from '@/db/schema';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let isBuyNow = false;
    try {
      const body = await request.json();
      if (body && typeof body.isBuyNow === 'boolean') {
        isBuyNow = body.isBuyNow;
      }
    } catch (_) {}

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
          eq(cartItem.userId, currentUser.user.id),
          eq(cartItem.isBuyNow, isBuyNow)
        )
      );

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.isAvailable) {
        return NextResponse.json({ error: `Shoe listing ${item.listingId} is no longer available` }, { status: 400 });
      }
      if (item.sellerId === currentUser.user.id) {
        return NextResponse.json({ error: 'You cannot purchase your own shoe listing' }, { status: 400 });
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
            recipientId: currentUser.user.id,
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

    return NextResponse.json({
      success: true,
      subtotal,
      total: subtotal,
      transactions: transactionResults,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
