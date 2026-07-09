import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { addCartItem } from '@/features/cart/services/service';

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

    const resultItem = await addCartItem(currentUser.user.id, listingId, quantity, isBuyNow);
    return NextResponse.json({ cartItem: resultItem });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
