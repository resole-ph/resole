import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getActiveRedeemOptions } from '@/features/transaction/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redeemOptions = await getActiveRedeemOptions();

  if (!redeemOptions) {
    return NextResponse.json({ error: 'Unable to fetch redeem options' }, { status: 500 });
  }

  return NextResponse.json({ redeemOptions });
}
