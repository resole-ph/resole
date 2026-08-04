import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { updateCartItem, deleteCartItem } from '@/features/cart/services/service';
import { parsePositiveInt } from '@/lib/id';

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
    const cartItemId = parsePositiveInt(id);
    if (!cartItemId) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    const result = await updateCartItem(cartItemId, currentUser.user.id, quantity);
    return NextResponse.json({ cartItem: result });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
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
    const cartItemId = parsePositiveInt(id);
    if (!cartItemId) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    await deleteCartItem(cartItemId, currentUser.user.id);
    return NextResponse.json({ message: 'Item successfully removed from cart' });
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
