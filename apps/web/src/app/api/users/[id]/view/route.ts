import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getUserById } from '@/features/auth/services/service';
import { createProfileView } from '@/features/view/services/service';

export async function POST(
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

  const profile = await getUserById(id);
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (profile.id === currentUser.user.id) {
      return NextResponse.json({ message: 'Self-view ignored.' }, { status: 200 });
    }

  await createProfileView({
    profileUserId: profile.id,
    viewerId: currentUser.user.id
  });

  return NextResponse.json({
    message: 'View saved.'
  });
}
