import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getAllVoucher } from '@/features/transaction/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vouchers = await getAllVoucher();

  if (!vouchers) {
    return NextResponse.json({ error: 'Unable to fetch vouchers.' }, { status: 500 });
  }

  return NextResponse.json({
    vouchers,
  });
}