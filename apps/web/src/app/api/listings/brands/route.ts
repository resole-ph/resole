import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeBrands } from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shoeCategories = await getShoeBrands();

  if (!shoeCategories) {
    return NextResponse.json({ error: 'Unable to fetch shoe brands.' }, { status: 500 });
  }

  return NextResponse.json({
    shoeCategories
  });
}