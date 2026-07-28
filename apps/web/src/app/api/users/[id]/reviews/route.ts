import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getReviewsForUser } from '@/features/user-action/services/service';

/** Reviews left about a user, newest first. */
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

  const reviews = await getReviewsForUser(id);
  if (!reviews) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  return NextResponse.json({ reviews });
}
