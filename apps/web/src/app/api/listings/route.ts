import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { 
  getAllShoeListing,
  getAllShoeListingForSale,
  getAllShoeListingForSwap,
  publishShoeListing
} from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  let shoeListings;
  
  switch (section) {
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

  if (!shoeListings || shoeListings.length === 0) {
    return NextResponse.json({ error: 'Shoe listings not found' }, { status: 404 });
  }

  return NextResponse.json({ shoeListings });
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newListing = await publishShoeListing(currentUser.user.id, body);
    return NextResponse.json({ listing: newListing });
  } catch (error: any) {
    console.error('Error creating shoe listing:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}