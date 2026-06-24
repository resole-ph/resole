import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { 
  getAllUserTransactions
} from '@/features/transaction/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userTransactions = await getAllUserTransactions(currentUser.user.id);
  if (!userTransactions || userTransactions.length === 0) {
    return NextResponse.json({ error: 'User transactions not found' }, { status: 404 });
  }

  return NextResponse.json({
    transactions: userTransactions
  })
}