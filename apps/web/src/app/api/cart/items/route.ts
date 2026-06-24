import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { db } from '@/config/db';
import { and, eq, isNull } from 'drizzle-orm';
import { cartItem, shoeListing } from '@/db/schema';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { listingId, quantity = 1, isBuyNow = false } = body;

    if (!listingId || typeof listingId !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid input payload' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Shoe listing not found or is no longer available' }, { status: 404 });
    }

    const targetListing = listings[0];

    if (targetListing.userId === currentUser.user.id) {
      return NextResponse.json({ error: 'You cannot add your own shoe listing to the cart' }, { status: 400 });
    }

    let resultItem;

    if (isBuyNow) {
      await db
        .delete(cartItem)
        .where(
          and(
            eq(cartItem.userId, currentUser.user.id),
            eq(cartItem.isBuyNow, true)
          )
        );

      const inserted = await db
        .insert(cartItem)
        .values({
          userId: currentUser.user.id,
          listingId: listingId,
          quantity: quantity,
          isBuyNow: true,
        })
        .returning();

      resultItem = inserted[0];
    } else {
      const existingItems = await db
        .select()
        .from(cartItem)
        .where(
          and(
            eq(cartItem.userId, currentUser.user.id),
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

        resultItem = updated[0];
      } else {
        const inserted = await db
          .insert(cartItem)
          .values({
            userId: currentUser.user.id,
            listingId: listingId,
            quantity: quantity,
            isBuyNow: false,
          })
          .returning();

        resultItem = inserted[0];
      }
    }

    return NextResponse.json({ cartItem: resultItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
