import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getOfferConversationForListing } from '@/features/inbox/services/service';

function parseShoeListingId(rawId: string) {
  const shoeListingId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(shoeListingId) || shoeListingId <= 0) {
    return null;
  }

  return shoeListingId;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const shoeListingId = parseShoeListingId(id);
  if (!shoeListingId) {
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const offer = await getOfferConversationForListing(currentUser.user.id, shoeListingId);

  return NextResponse.json({ offer });
}
