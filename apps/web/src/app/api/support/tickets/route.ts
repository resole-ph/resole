import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { createTicket } from '@/features/ticket/services/service';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const ticket = await createTicket(body);
  if (!ticket) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 400 });
  }

  return NextResponse.json({
    ticket: ticket
  });
}