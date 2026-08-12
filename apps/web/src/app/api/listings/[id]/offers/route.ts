import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getListingOffers } from '@/features/inbox/services/service';
import { getShoeListingById } from '@/features/shoe/services/service';
import { parsePositiveInt } from '@/lib/id';

/**
 * Offers received on a listing, for its seller.
 *
 * Seller-only by design: the rows name every buyer who has offered and how much
 * they bid, which is nobody else's business — including the other bidders'.
 * Sibling route `/offer` is the buyer-side counterpart and returns only the
 * caller's own offer.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const shoeListingId = parsePositiveInt(id);
  if (!shoeListingId) {
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }

  if (shoeListing.seller.id !== currentUser.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const offers = await getListingOffers(shoeListingId);
  if (!offers) {
    return NextResponse.json({ error: 'Unable to fetch offers for this listing.' }, { status: 500 });
  }

  return NextResponse.json({ offers });
}
