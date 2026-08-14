import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import {
  getTransactionById,
  updateSaleByTransactionId,
  updateSwapItemsByTransactionId,
  resetOfferToPending
} from '@/features/transaction/services/service';
import { createNotification } from '@/features/notifications/services/service';
import { getShoeListingById } from '@/features/shoe/services/service';

function parseTransactionId(rawId: string) {
  const transactionId = Number.parseInt(rawId, 10);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return null;
  }

  return transactionId;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Invalid request payload';
}

type SaleEdit = { price: number };
type SwapEdit = { listings: number[]; topUp?: number };

const MAX_CASH_TOP_UP = 1_000_000;

function parseCashTopUp(value: unknown): number {
  const rawValue = String(value).trim();
  const topUp = Number(rawValue);
  if (!/^\d+(?:\.\d{1,2})?$/.test(rawValue) || !Number.isFinite(topUp) || topUp > MAX_CASH_TOP_UP) {
    throw new Error('Cash top-up must be between ₱0 and ₱1,000,000 with at most two decimal places');
  }
  return topUp;
}

function parseEditPayload(type: string, body: Record<string, unknown>): SaleEdit | SwapEdit {
  if (type === 'sale') {
    if (body.price === undefined) {
      throw new Error('Price is required to edit this offer');
    }

    const price = Number.parseFloat(String(body.price));
    if (Number.isNaN(price) || price <= 0) {
      throw new Error('Invalid price');
    }

    return { price };
  }

  if (type === 'swap') {
    if (!Array.isArray(body.listings) || body.listings.length === 0) {
      throw new Error('At least one listing is required to edit this offer');
    }

    const listings = body.listings.map((listing) => Number.parseInt(String(listing), 10));
    if (listings.some((listing) => !Number.isInteger(listing) || listing <= 0)) {
      throw new Error('Invalid listing id');
    }

    const topUp = body.topUp === undefined ? undefined : parseCashTopUp(body.topUp);
    return { listings, topUp };
  }

  throw new Error('This offer type cannot be edited');
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const transactionId = parseTransactionId(id);
  if (!transactionId) {
    return NextResponse.json({ error: 'Invalid transaction id' }, { status: 400 });
  }

  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  if (transaction.recipientId !== currentUser.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (transaction.isCompleted) {
    return NextResponse.json({ error: 'Offer is already completed' }, { status: 409 });
  }

  try {
    const body = await request.json();
    const edit = parseEditPayload(transaction.type, body);

    if ('listings' in edit) {
      const offeredListings = await Promise.all(edit.listings.map((listingId) => getShoeListingById(listingId)));
      if (offeredListings.some((listing) => !listing || listing.seller.id !== currentUser.user.id || !listing.isAvailable || listing.archivedAt)) {
        return NextResponse.json({ error: 'You can only offer your own active listings' }, { status: 400 });
      }
    }

    let details: { price: string } | { items: { itemId: number }[]; topUp: string | null };

    if ('price' in edit) {
      const updatedSale = await updateSaleByTransactionId(transaction.id, edit.price);
      if (!updatedSale) {
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 400 });
      }
      details = { price: updatedSale.price };
    } else {
      const updatedSwap = await updateSwapItemsByTransactionId(transaction.id, edit.listings, edit.topUp);
      if (!updatedSwap) {
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 400 });
      }
      details = {
        items: updatedSwap.items
          .filter((item): item is typeof item & { itemId: number } => item.itemId != null)
          .map((item) => ({ itemId: item.itemId })),
        topUp: updatedSwap.topUp,
      };
    }

    await resetOfferToPending(transaction.id);

    await createNotification({
      userId: transaction.listing.userId,
      category: 'offer',
      title: 'Offer updated',
      body: 'The buyer updated their offer — take another look.',
      entityType: 'transaction',
      entityId: String(transaction.id),
    });

    return NextResponse.json({ message: 'Offer updated successfully', details });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
