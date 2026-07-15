import { getConditionLabel } from '@/features/sell/utils/condition';
import type { ShoeListing } from '@/features/shoe/types/types';

/** Flattens a joined shoe_listing/shoe/user row into the shape API clients expect. */
export function serializeShoeListing(row: ShoeListing) {
  return {
    id: String(row.id),
    model: row.shoe.model,
    brand: row.shoe.brand,
    price: Number(row.value),
    condition: getConditionLabel(Number(row.conditionScore)),
    conditionScore: Number(row.conditionScore),
    imageUrl: row.imageUrlTop,
    imageUrlTop: row.imageUrlTop,
    imageUrlSide: row.imageUrlSide,
    imageUrlSole: row.imageUrlSole,
    imageUrlInsole: row.imageUrlInsole,
    listingMode: row.listingMode,
    isAvailable: row.isAvailable,
    isRefurbished: row.isRefurbished,
    category: row.shoe.category,
    co2Footprint: row.shoe.co2Footprint ? Number(row.shoe.co2Footprint) : null,
    description: row.description ?? undefined,
    size: String(row.size),
    colorway: row.colorway,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    seller: {
      id: row.seller.id,
      name: row.seller.name,
      image: row.seller.image ?? undefined,
    },
  };
}
