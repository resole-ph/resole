import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeBySearch } from '@/features/shoe/services/service';

export async function GET(request: Request, query: string) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (query.length < 3) {
    return NextResponse.json({ error: 'Search query must be at least 3 characters long.'}, { status: 400 } );
  }

  const shoeSearch = await getShoeBySearch(query);

  if (!shoeSearch) {
    return NextResponse.json({ error: 'Unable to fetch shoe search.' }, { status: 500 });
  }

  return NextResponse.json({
    shoeSearch
  });
}