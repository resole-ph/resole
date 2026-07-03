import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { getAllCharity } from '@/features/charity/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const charities = await getAllCharity();
  if (!charities) {
    return NextResponse.json({ error: 'Failed to fetch drop-off points' }, { status: 500 });
  }

  const dropOffPoints = charities.map((charity) => ({
    id: charity.id,
    charityId: charity.id,
    name: charity.name,
    address: charity.address,
    coordinator: charity.coordinator,
    email: charity.email,
    contactNo: charity.contactNo,
  }));

  return NextResponse.json({ dropOffPoints });
}
