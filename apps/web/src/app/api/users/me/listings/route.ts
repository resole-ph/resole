import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingsByUserId } from '@/features/shoe/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

const CONDITION_OPTIONS = ['Like New', 'Excellent', 'Good', 'Fair', 'Poor'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'price_low', 'price_high'] as const;

function parseOptionalNumber(value: string | null, maximum?: number) {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || (maximum !== undefined && parsed > maximum)) {
    return undefined;
  }

  return parsed;
}

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedConditions = searchParams.getAll('condition');
  const requestedSort = searchParams.get('sort');
  const filters = {
    sizes: searchParams
      .getAll('size')
      .filter((size) => Number.isFinite(Number(size))),
    colors: searchParams.getAll('color').filter(Boolean),
    conditions: CONDITION_OPTIONS.filter((condition) => requestedConditions.includes(condition)),
    minRating: parseOptionalNumber(searchParams.get('minRating'), 5),
    priceMin: parseOptionalNumber(searchParams.get('priceMin')),
    priceMax: parseOptionalNumber(searchParams.get('priceMax')),
    sort: SORT_OPTIONS.find((option) => option === requestedSort) ?? 'newest',
  };

  const shoeListings = await getShoeListingsByUserId(currentUser.user.id, filters);
  if (!shoeListings) {
    return NextResponse.json({ error: 'Failed to fetch shoe listings' }, { status: 500 });
  }

  return NextResponse.json({ shoeListings: shoeListings.map(serializeShoeListing) });
}
