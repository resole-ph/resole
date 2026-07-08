import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingsByUserId } from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shoeListings = await getShoeListingsByUserId(currentUser.user.id);
  if (!shoeListings) {
    return NextResponse.json({ error: 'Failed to fetch shoe listings' }, { status: 500 });
  }

  return NextResponse.json({ shoeListings: shoeListings.map(serializeShoeListing) });
}