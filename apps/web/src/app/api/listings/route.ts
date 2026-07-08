import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import {
  getAllShoeListing,
  getAllShoeListingForSale,
  getAllShoeListingForSwap,
  publishShoeListing
} from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const filters = {
    brand: searchParams.get('brand') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  };

  let shoeListings;

  switch (section) {
    case 'sale-board':
      shoeListings = await getAllShoeListingForSale(filters);
      break;
    case 'swap-board':
      shoeListings = await getAllShoeListingForSwap(filters);
      break;
    default:
      shoeListings = await getAllShoeListing(filters);
      break;
  }

  return NextResponse.json({ shoeListings: (shoeListings ?? []).map(serializeShoeListing) });
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const newListing = await publishShoeListing(currentUser.user.id, body);
  if (!newListing) {
    return NextResponse.json({ error: "Failed to create new listing" }, { status: 400 });
  }
  
  return NextResponse.json({ 
    listingId: newListing.id,
    listingUrl: `/listing/${newListing.id}` 
  });
}