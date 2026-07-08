import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserTransactionHistory } from '@/features/transaction/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = await getUserTransactionHistory(currentUser.user.id);
  if (!transactions) {
    return NextResponse.json({ error: 'Unable to fetch transactions' }, { status: 500 });
  }

  return NextResponse.json({ transactions });
}
