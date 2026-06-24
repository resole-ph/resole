import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { db } from '@/config/db';
import { and, eq } from 'drizzle-orm';
import { cartItem } from '@/db/schema';

function parseCartItemId(rawId: string) {
  const cartItemId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return null;
  }

  return cartItemId;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cartItemId = parseCartItemId(id);
    if (!cartItemId) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    const updated = await db
      .update(cartItem)
      .set({
        quantity: quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cartItem.id, cartItemId),
          eq(cartItem.userId, currentUser.user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Cart item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ cartItem: updated[0] });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cartItemId = parseCartItemId(id);
    if (!cartItemId) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    const deleted = await db
      .delete(cartItem)
      .where(
        and(
          eq(cartItem.id, cartItemId),
          eq(cartItem.userId, currentUser.user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Cart item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item successfully removed from cart' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
