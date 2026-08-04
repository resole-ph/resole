import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getSearchSuggestions } from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({ shoes: [], people: [] });
  }

  const suggestions = await getSearchSuggestions(query);
  return NextResponse.json(suggestions);
}
