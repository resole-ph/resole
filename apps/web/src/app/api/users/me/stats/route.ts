import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserStatsById } from '@/features/auth/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userStats = await getUserStatsById(currentUser.user.id);

  if (!userStats) {
    return NextResponse.json({ error: 'Unable to fetch user statistics' }, { status: 500 });
  }

  return NextResponse.json({
    userStats
  });
}