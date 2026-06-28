import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { checkoutCart } from '@/features/transaction/services/service';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let isBuyNow = false;
    const body = await request.json();
    if (body && typeof body.isBuyNow === 'boolean') {
      isBuyNow = body.isBuyNow;
    }

    const checkoutResult = await checkoutCart(currentUser.user.id, isBuyNow);

    return NextResponse.json({
      success: true,
      total: checkoutResult.total,
      transactions: checkoutResult.transactions,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Invalid request payload or checkout failed' }, { status: 400 });
  }
}
