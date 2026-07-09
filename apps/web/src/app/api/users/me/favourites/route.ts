import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getFavouriteListingsByUserId } from '@/features/user-action/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const favourites = await getFavouriteListingsByUserId(currentUser.user.id);
  if (!favourites) {
    return NextResponse.json({ error: 'Failed to fetch favourites summary' }, { status: 500 });
  }

  return NextResponse.json({
    totalCount: favourites.length,
    favourites,
  });
}
