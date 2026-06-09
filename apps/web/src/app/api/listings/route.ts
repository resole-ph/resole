import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getAllShoeListing } from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shoeListings = await getAllShoeListing();

  if (!shoeListings) {
    return NextResponse.json({ error: 'Unable to fetch shoe listings.' }, { status: 500 });
  }

  return NextResponse.json({
    shoeListings
  });
}