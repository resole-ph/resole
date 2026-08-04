import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingById } from '@/features/shoe/services/service';
import {
  getFavouriteListingsByUserId,
  removeFavouriteListing,
  saveFavouriteListing,
} from '@/features/user-action/services/service';
import { NextRequest, NextResponse } from 'next/server';
import { parsePositiveInt } from '@/lib/id';

type SaveListingContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getListingId(context: SaveListingContext) {
  const { id } = await context.params;
  return parsePositiveInt(id);
}

export async function POST(request: NextRequest, context: SaveListingContext) {
  const authSession = await getAuthenticatedUser(request);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const listingId = await getListingId(context);
  if (!listingId) {
    return NextResponse.json({ error: 'Invalid listing ID.' }, { status: 400 });
  }

  const listing = await getShoeListingById(listingId);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }
  if (!listing.isAvailable || listing.archivedAt) {
    return NextResponse.json({ error: 'This listing is no longer available.' }, { status: 409 });
  }

  const saved = await saveFavouriteListing(authSession.user.id, listingId);
  if (!saved) {
    return NextResponse.json(
      { error: 'Error saving listing.' },
      { status: 500 },
    );
  }

  const favourites = await getFavouriteListingsByUserId(authSession.user.id);
  return NextResponse.json({ favourites: favourites ?? [] });
}

export async function DELETE(request: NextRequest, context: SaveListingContext) {
  const authSession = await getAuthenticatedUser(request);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const listingId = await getListingId(context);
  if (!listingId) {
    return NextResponse.json({ error: 'Invalid listing ID.' }, { status: 400 });
  }

  const listing = await getShoeListingById(listingId);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  const removed = await removeFavouriteListing(authSession.user.id, listingId);
  if (!removed) {
    return NextResponse.json(
      { error: 'Error removing saved listing.' },
      { status: 500 },
    );
  }

  const favourites = await getFavouriteListingsByUserId(authSession.user.id);
  return NextResponse.json({ favourites: favourites ?? [] });
}
