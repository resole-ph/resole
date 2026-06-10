import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { 
  getAllShoeListing,
  getAllShoeListingForSale,
  getAllShoeListingForSwap
 } from '@/features/shoe/services/service';

export async function POST(
  request: Request, 
  context: { params: Promise<{ query: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { query } = await context.params;

  let shoeListings;
  switch (query) {
    case 'sale-board':
      shoeListings = await getAllShoeListingForSale();
      break;
    case 'swap-board':
      shoeListings = await getAllShoeListingForSwap();
      break;
    default:
      shoeListings = await getAllShoeListing();
      break;
  }

  if (!shoeListings) {
    return NextResponse.json({ error: 'Shoe listings not found' }, { status: 404 });
  }

  return NextResponse.json({
    shoeListings,
  });
}