import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const 

  return;
}