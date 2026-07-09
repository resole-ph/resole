import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingSummaryByUserId } from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const listingSummary = await getShoeListingSummaryByUserId(currentUser.user.id);
  if (!listingSummary) {
    return NextResponse.json({ error: 'Failed to fetch listing summary' }, { status: 500 });
  }

  return NextResponse.json({ listingSummary });
}
