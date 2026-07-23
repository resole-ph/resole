import { getConditionLabel } from '@/features/sell/utils/condition';
import type { ShoeListing } from '@/features/shoe/types/types';

export type SerializedShoeListing = ReturnType<typeof serializeShoeListing>;

/** Flattens a joined shoe_listing/shoe/user row into the shape API clients expect. */
export function serializeShoeListing(row: ShoeListing) {
  return {
    id: String(row.id),
    model: row.shoe.model,
    brand: row.shoe.brand,
    price: Number(row.value),
    originalPrice: row.shoe?.originalPrice ? Number(row.shoe.originalPrice) : undefined, // Useful for discounts/strikethroughs
    condition: getConditionLabel(Number(row.conditionScore)),
    conditionScore: Number(row.conditionScore),
    imageUrl: row.imageUrlTop,
    imageUrlTop: row.imageUrlTop,
    imageUrlLeftSide: row.imageUrlLeftSide,
    imageUrlRightSide: row.imageUrlRightSide,
    imageUrlSole: row.imageUrlSole,
    imageUrlInsole: row.imageUrlInsole,
    listingMode: row.listingMode,
    isAvailable: row.isAvailable,
    isRefurbished: row.isRefurbished,
    freeShipping: Boolean(row.freeShipping), // Mapped if available in DB
    category: row.shoe.category,
    co2Footprint: row.shoe.co2Footprint && !isNaN(Number(row.shoe.co2Footprint)) ? Number(row.shoe.co2Footprint) : null,
    description: row.description ?? undefined,
    size: String(row.size),
    colorway: row.colorway,
    swapFor: row.swapFor ?? undefined, // 👈 CRITICAL for Swap Board cards!
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    deletedAt: row.deletedAt ? new Date(row.deletedAt).toISOString() : undefined,
    seller: {
      id: row.seller.id,
      name: row.seller.name,
      image: row.seller.image ?? undefined,
      rating: row.seller.rating ? Number(row.seller.rating) : undefined, // 👈 For seller star ratings
    },
  };
}