import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingsBySearch } from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  if (query.length < 3) {
    return NextResponse.json({ error: 'Search query must be at least 3 characters long.'}, { status: 400 } );
  }

  const shoeSearch = await getShoeListingsBySearch(query);

  if (!shoeSearch) {
    return NextResponse.json({ error: 'Unable to fetch shoe search.' }, { status: 500 });
  }

  return NextResponse.json({
    shoeSearch: shoeSearch.map(serializeShoeListing)
  });
}