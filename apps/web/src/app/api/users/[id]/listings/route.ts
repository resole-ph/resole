import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingsByUserId } from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

/** Another user's live listings — only what is still on the market. */
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

  const shoeListings = await getShoeListingsByUserId(id);
  if (!shoeListings) {
    return NextResponse.json({ error: 'Failed to fetch shoe listings' }, { status: 500 });
  }

  return NextResponse.json({
    shoeListings: shoeListings
      .filter((listing) => listing.isAvailable !== false)
      .map(serializeShoeListing),
  });
}
