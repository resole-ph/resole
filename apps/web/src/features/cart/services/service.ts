import { db } from '@/config/db';
import { and, eq, getTableColumns, isNull } from 'drizzle-orm';
import { cartItem, shoeListing, shoe } from '@/db/schema';

export async function getCartItems(userId: string, isBuyNow: boolean) {
  return db
    .select({
      cartItemId: cartItem.id,
      quantity: cartItem.quantity,
      isBuyNow: cartItem.isBuyNow,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
      listing: getTableColumns(shoeListing),
      shoe: getTableColumns(shoe),
    })
    .from(cartItem)
    .innerJoin(shoeListing, eq(cartItem.listingId, shoeListing.id))
    .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
    .where(
      and(
        eq(cartItem.userId, userId),
        eq(cartItem.isBuyNow, isBuyNow)
      )
    );
}

export async function addCartItem(userId: string, listingId: number, quantity: number, isBuyNow: boolean) {
  const listings = await db
    .select()
    .from(shoeListing)
    .where(
      and(
        eq(shoeListing.id, listingId),
        eq(shoeListing.isAvailable, true),
        isNull(shoeListing.deletedAt)
      )
    )
    .limit(1);

  if (listings.length === 0) {
    throw new Error('Shoe listing not found or is no longer available');
  }

  const targetListing = listings[0];

  if (targetListing.userId === userId) {
    throw new Error('You cannot add your own shoe listing to the cart');
  }

  if (isBuyNow) {
    await db
      .delete(cartItem)
      .where(
        and(
          eq(cartItem.userId, userId),
          eq(cartItem.isBuyNow, true)
        )
      );

    const inserted = await db
      .insert(cartItem)
      .values({
        userId,
        listingId,
        quantity,
        isBuyNow: true,
      })
      .returning();

    return inserted[0];
  } else {
    const existingItems = await db
      .select()
      .from(cartItem)
      .where(
        and(
          eq(cartItem.userId, userId),
          eq(cartItem.listingId, listingId),
          eq(cartItem.isBuyNow, false)
        )
      )
      .limit(1);

    if (existingItems.length > 0) {
      const updated = await db
        .update(cartItem)
        .set({
          quantity: existingItems[0].quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItem.id, existingItems[0].id))
        .returning();

      return updated[0];
    } else {
      const inserted = await db
        .insert(cartItem)
        .values({
          userId,
          listingId,
          quantity,
          isBuyNow: false,
        })
        .returning();

      return inserted[0];
    }
  }
}

export async function updateCartItem(cartItemId: number, userId: string, quantity: number) {
  const updated = await db
    .update(cartItem)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(cartItem.id, cartItemId),
        eq(cartItem.userId, userId)
      )
    )
    .returning();

  if (updated.length === 0) {
    throw new Error('Cart item not found or unauthorized');
  }

  return updated[0];
}

export async function deleteCartItem(cartItemId: number, userId: string) {
  const deleted = await db
    .delete(cartItem)
    .where(
      and(
        eq(cartItem.id, cartItemId),
        eq(cartItem.userId, userId)
      )
    )
    .returning();

  if (deleted.length === 0) {
    throw new Error('Cart item not found or unauthorized');
  }

  return deleted[0];
}
