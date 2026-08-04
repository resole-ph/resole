import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import {
  getShoeListingById,
  updateShoeListing,
  permanentlyDeleteShoeListing,
  ListingNotArchivedError,
  ListingHasTransactionHistoryError
} from '@/features/shoe/services/service';
import type { UpdateShoeListing } from '@/features/shoe/types/types';
import { createListingView } from '@/features/view/services/service';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';

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
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }

  if (shoeListing.archivedAt && shoeListing.seller.id !== currentUser.user.id) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const isViewMode = searchParams.get('view') === 'true';

  if (isViewMode) {
    await createListingView({
      listingId: shoeListing.id,
      viewerId: currentUser.user.id
    });
  }

  return NextResponse.json({
    shoeListing: serializeShoeListing(shoeListing)
  })
}

function getEditableShoeListingFields(body: Record<string, unknown>) {
  const updateData: UpdateShoeListing = {};

  if (body.value !== undefined) {
    const value = Number.parseFloat(String(body.value));
    if (Number.isNaN(value) || value <= 0) {
      throw new Error('Invalid listing value');
    }
    updateData.value = value.toString();
  }

  if (body.description !== undefined) {
    updateData.description = body.description === null ? null : String(body.description);
  }

  if (body.colorway !== undefined) {
    const colorway = String(body.colorway).trim();
    if (!colorway) {
      throw new Error('Invalid colorway');
    }
    updateData.colorway = colorway;
  }

  if (body.size !== undefined) {
    const size = Number.parseFloat(String(body.size));
    if (Number.isNaN(size) || size <= 0) {
      throw new Error('Invalid size');
    }
    updateData.size = size.toString();
  }

  if (body.conditionScore !== undefined) {
    const conditionScore = Number.parseFloat(String(body.conditionScore));
    if (Number.isNaN(conditionScore) || conditionScore <= 0) {
      throw new Error('Invalid condition score');
    }
    updateData.conditionScore = conditionScore.toString();
  }

  if (body.defects !== undefined) {
    if (!Array.isArray(body.defects) || body.defects.some((defect) => typeof defect !== 'string')) {
      throw new Error('Invalid defects');
    }
    updateData.defects = body.defects;
  }

  if (body.isRefurbished !== undefined) {
    if (typeof body.isRefurbished !== 'boolean') {
      throw new Error('Invalid refurbished value');
    }
    updateData.isRefurbished = body.isRefurbished;
  }

  if (body.isAvailable !== undefined) {
    if (typeof body.isAvailable !== 'boolean') {
      throw new Error('Invalid availability value');
    }
    updateData.isAvailable = body.isAvailable;
  }

  if (body.listingMode !== undefined) {
    if (body.listingMode !== 'Sale' && body.listingMode !== 'Swap' && body.listingMode !== 'Both') {
      throw new Error('Invalid listing mode');
    }
    updateData.listingMode = body.listingMode;
  }

  if (body.imageUrlTop !== undefined) {
    updateData.imageUrlTop = String(body.imageUrlTop);
  }

  if (body.imageUrlLeftSide !== undefined) {
    updateData.imageUrlLeftSide = String(body.imageUrlLeftSide);
  }

  if (body.imageUrlRightSide !== undefined) {
    updateData.imageUrlRightSide = String(body.imageUrlRightSide);
  }

  if (body.imageUrlSole !== undefined) {
    updateData.imageUrlSole = String(body.imageUrlSole);
  }

  const insoleVal = body.imageUrlInsole || body.imageUrlInsoleRight || body.imageUrlInsoleLeft;
  if (insoleVal !== undefined) {
    updateData.imageUrlInsole = String(insoleVal);
  }

  return updateData;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Invalid request payload';
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
  const shoeListingId = parseShoeListingId(id);
  if (!shoeListingId) {
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }

  if (shoeListing.seller.id !== currentUser.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (shoeListing.archivedAt) {
      return NextResponse.json({ error: 'Archived listings cannot be edited or relisted' }, { status: 409 });
    }

    const updateData = getEditableShoeListingFields(body);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No editable listing fields provided' }, { status: 400 });
    }

    const updatedShoeListing = await updateShoeListing(updateData, shoeListingId);
    if (!updatedShoeListing) {
      return NextResponse.json({ error: 'Failed to update shoe listing' }, { status: 400 });
    }

    return NextResponse.json({ shoeListing: updatedShoeListing });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(
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
    return NextResponse.json({ error: 'Invalid shoe listing id' }, { status: 400 });
  }

  const shoeListing = await getShoeListingById(shoeListingId);
  if (!shoeListing) {
    return NextResponse.json({ error: 'Shoe listing not found' }, { status: 404 });
  }

  if (shoeListing.seller.id !== currentUser.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const deletedShoeListing = await permanentlyDeleteShoeListing(currentUser.user.id, shoeListingId);
    if (!deletedShoeListing) {
      return NextResponse.json({ error: 'Failed to delete shoe listing' }, { status: 400 });
    }

    return NextResponse.json({ message: deletedShoeListing });
  } catch (error: unknown) {
    if (error instanceof ListingNotArchivedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ListingHasTransactionHistoryError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete shoe listing' }, { status: 400 });
  }
}
