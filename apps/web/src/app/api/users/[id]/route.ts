import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserProfileById, getUserStatsById } from '@/features/auth/services/service';

/**
 * Public profile of another user. Deliberately narrower than `/api/users/me`:
 * contact details and account settings never leave the owner's own endpoint.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const profile = await getUserProfileById(id);
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stats = await getUserStatsById(id);

  return NextResponse.json({
    user: {
      id: profile.id,
      name: profile.name,
      image: profile.image,
      description: profile.description,
      location: profile.location,
      overallRating: profile.overallRating,
      reviewCount: profile.reviewCount,
      joinedYear: profile.joinedYear,
      listingCount: stats?.listingCount ?? 0,
      salesCount: stats?.salesCount ?? 0,
      swapsCount: stats?.swapsCount ?? 0,
    },
  });
}
