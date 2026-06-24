import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { db } from '@/config/db';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { cartItem, shoeListing, shoe } from '@/db/schema';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const isBuyNow = searchParams.get('isBuyNow') === 'true';

    const items = await db
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
          eq(cartItem.userId, currentUser.user.id),
          eq(cartItem.isBuyNow, isBuyNow)
        )
      );

    return NextResponse.json({ cart: items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
