import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getShoeListingById } from '@/features/shoe/services/service';

function parseShoeListingId(rawId: string) {
  const shoeListingId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(shoeListingId) || shoeListingId <= 0) {
    return null;
  }

  return shoeListingId;
}

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const shoeListingId = parseShoeListingId(id);
  if (!shoeListingId) {
    return NextResponse.json({ error: 'Invalid notification id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Invalid shoeListingId id' }, { status: 404 });
  }

  return NextResponse.json({
    shoeListing: shoeListing
  })
}