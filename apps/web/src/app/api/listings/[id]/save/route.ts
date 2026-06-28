import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createSave } from '@/features/user-action/services/service';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  body['userId'] = currentUser.user.id;

  const save = await createSave(body);
  if (!save) {
    return NextResponse.json({ error: 'Failed to create save' }, { status: 400 });
  }

  return NextResponse.json({
    save: save
  });
}