import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import {
  getShoeListingById,
  deleteUserShoeListing,
  ListingNotArchivedError,
  ListingHasTransactionHistoryError,
} from '@/features/shoe/services/service';
import { parsePositiveInt } from '@/lib/id';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
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

  try {
    const deletedShoeListing = await deleteUserShoeListing(currentUser.user.id, shoeListingId);
    if (!deletedShoeListing) {
      return NextResponse.json({ error: 'Failed to delete shoe listing' }, { status: 400 });
    }

    return NextResponse.json({ message: deletedShoeListing });
  } catch (error: unknown) {
    if (error instanceof ListingNotArchivedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ListingHasTransactionHistoryError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete shoe listing' }, { status: 400 });
  }
}
