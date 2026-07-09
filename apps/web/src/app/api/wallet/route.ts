import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getWalletByUserId } from '@/features/transaction/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wallet = await getWalletByUserId(currentUser.user.id);

  if (!wallet) {
    return NextResponse.json({ error: 'Unable to fetch wallet' }, { status: 500 });
  }

  return NextResponse.json({ wallet });
}
