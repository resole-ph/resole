import { getAuthenticatedUser } from '@/lib/request-auth';
import { getFavouriteListingsByUserId } from '@/features/user-action/services/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authSession = await getAuthenticatedUser(request);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const favourites = await getFavouriteListingsByUserId(authSession.user.id);
  if (!favourites) {
    return NextResponse.json(
      { error: 'Error fetching favourite listings.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ favourites });
}
