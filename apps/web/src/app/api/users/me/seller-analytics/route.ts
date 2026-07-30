import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getListingViewsBySellerId, getProfileViewsByProfileUserId, getProfileListingSavesBySellerId } from '@/features/view/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const listingViews = await getListingViewsBySellerId(currentUser.user.id);
  const profileViews = await getProfileViewsByProfileUserId(currentUser.user.id);
  const listingSaves = await getProfileListingSavesBySellerId(currentUser.user.id)

  if (!listingViews || !profileViews || !listingSaves) {
    return NextResponse.json({ error: 'Unable to fetch user seller analytics' }, { status: 500 });
  }

  return NextResponse.json({
    listingViews,
    profileViews,
    listingSaves
  });
}