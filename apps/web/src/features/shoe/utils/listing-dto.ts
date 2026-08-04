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
    archivedAt: row.archivedAt ? new Date(row.archivedAt).toISOString() : null,
    isRefurbished: row.isRefurbished,
    // TODO: no backing column yet — shipping is a planned feature. Hardcoded false so
    // the badge stays hidden until shoe_listing gains a real free-shipping flag.
    freeShipping: false,
    category: row.shoe.category,
    co2Footprint: row.shoe.co2Footprint && !isNaN(Number(row.shoe.co2Footprint)) ? Number(row.shoe.co2Footprint) : null,
    description: row.description ?? undefined,
    size: String(row.size),
    colorway: row.colorway,
    // TODO: no backing column yet — swap cards fall back to "Open to offers" until
    // shoe_listing can record what a seller is looking for.
    swapFor: undefined as string | undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    seller: {
      id: row.seller.id,
      name: row.seller.name,
      image: row.seller.image ?? undefined,
      rating: row.seller.rating ? Number(row.seller.rating) : undefined, // 👈 For seller star ratings
    },
  };
}
