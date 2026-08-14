import { describe, expect, it } from 'vitest';
import { serializeShoeListing } from '@/features/shoe/utils/listing-dto';
import type { ShoeListing } from '@/features/shoe/types/types';

/**
 * `serializeShoeListing` is the API contract every client renders from, so these
 * tests pin the shape rather than the implementation. The input is a joined
 * Drizzle row; only the fields the serializer reads are modelled here.
 */
function listingRow(overrides: Record<string, unknown> = {}): ShoeListing {
  return {
    id: 42,
    value: '4500.00',
    conditionScore: '8.5',
    imageUrlTop: 'https://cdn.test/top.jpg',
    imageUrlLeftSide: 'https://cdn.test/left.jpg',
    imageUrlRightSide: 'https://cdn.test/right.jpg',
    imageUrlSole: 'https://cdn.test/sole.jpg',
    imageUrlInsole: 'https://cdn.test/insole.jpg',
    imageUrlInsoleLeft: null,
    imageUrlInsoleRight: null,
    listingMode: 'sale',
    isAvailable: true,
    archivedAt: null,
    isRefurbished: false,
    description: 'Lightly worn.',
    size: '10',
    colorway: 'Triple White',
    createdAt: new Date('2026-01-15T08:30:00.000Z'),
    updatedAt: new Date('2026-02-01T08:30:00.000Z'),
    shoe: {
      brand: 'Nike',
      model: 'Air Force 1',
      category: 'casual',
      co2Footprint: '13.6',
      originalPrice: '7500.00',
    },
    seller: {
      id: 'user_1',
      name: 'Rainer',
      image: 'https://cdn.test/avatar.jpg',
      rating: '4.5',
      city: 'Manila',
      address: '123 Taft Ave',
    },
    ...overrides,
  } as unknown as ShoeListing;
}

describe('serializeShoeListing', () => {
  it('flattens the joined row into the client-facing shape', () => {
    const dto = serializeShoeListing(listingRow());

    expect(dto.id).toBe('42');
    expect(dto.brand).toBe('Nike');
    expect(dto.model).toBe('Air Force 1');
    expect(dto.category).toBe('casual');
    expect(dto.colorway).toBe('Triple White');
    expect(dto.listingMode).toBe('sale');
    expect(dto.isAvailable).toBe(true);
  });

  it('exposes the id as a string so clients never do arithmetic on it', () => {
    expect(serializeShoeListing(listingRow({ id: 7 })).id).toBe('7');
  });

  it('converts the decimal price columns to numbers', () => {
    const dto = serializeShoeListing(listingRow());
    expect(dto.price).toBe(4500);
    expect(dto.originalPrice).toBe(7500);
    expect(dto.conditionScore).toBe(8.5);
  });

  it('omits originalPrice when the catalog has no matching retail price', () => {
    const dto = serializeShoeListing(listingRow({ shoe: { ...listingRow().shoe, originalPrice: null } }));
    expect(dto.originalPrice).toBeUndefined();
  });

  it('derives the condition label from the score', () => {
    expect(serializeShoeListing(listingRow({ conditionScore: '9.2' })).condition).toBe('Like New');
    expect(serializeShoeListing(listingRow({ conditionScore: '8.5' })).condition).toBe('Good');
    expect(serializeShoeListing(listingRow({ conditionScore: '3.0' })).condition).toBe('Poor');
  });

  describe('insole images', () => {
    it('falls back to the single insole photo when per-foot photos are missing', () => {
      const dto = serializeShoeListing(listingRow());
      expect(dto.imageUrlInsoleLeft).toBe('https://cdn.test/insole.jpg');
      expect(dto.imageUrlInsoleRight).toBe('https://cdn.test/insole.jpg');
    });

    it('prefers the per-foot photos when they exist', () => {
      const dto = serializeShoeListing(
        listingRow({
          imageUrlInsoleLeft: 'https://cdn.test/insole-l.jpg',
          imageUrlInsoleRight: 'https://cdn.test/insole-r.jpg',
        })
      );
      expect(dto.imageUrlInsoleLeft).toBe('https://cdn.test/insole-l.jpg');
      expect(dto.imageUrlInsoleRight).toBe('https://cdn.test/insole-r.jpg');
    });
  });

  it('mirrors the top photo into the generic imageUrl field', () => {
    const dto = serializeShoeListing(listingRow());
    expect(dto.imageUrl).toBe(dto.imageUrlTop);
  });

  describe('co2Footprint', () => {
    it('is a number when the catalog has a usable value', () => {
      expect(serializeShoeListing(listingRow()).co2Footprint).toBe(13.6);
    });

    it('is null when the value is missing', () => {
      const row = listingRow();
      const dto = serializeShoeListing(listingRow({ shoe: { ...row.shoe, co2Footprint: null } }));
      expect(dto.co2Footprint).toBeNull();
    });

    it('is null rather than NaN when the value is not numeric', () => {
      const row = listingRow();
      const dto = serializeShoeListing(listingRow({ shoe: { ...row.shoe, co2Footprint: 'unknown' } }));
      expect(dto.co2Footprint).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('serializes dates to ISO strings', () => {
      const dto = serializeShoeListing(listingRow());
      expect(dto.createdAt).toBe('2026-01-15T08:30:00.000Z');
      expect(dto.updatedAt).toBe('2026-02-01T08:30:00.000Z');
    });

    it('keeps archivedAt null for a live listing', () => {
      expect(serializeShoeListing(listingRow()).archivedAt).toBeNull();
    });

    it('serializes archivedAt when the listing has been archived', () => {
      const dto = serializeShoeListing(listingRow({ archivedAt: new Date('2026-03-01T00:00:00.000Z') }));
      expect(dto.archivedAt).toBe('2026-03-01T00:00:00.000Z');
    });

    it('substitutes a valid ISO string when createdAt is missing', () => {
      const dto = serializeShoeListing(listingRow({ createdAt: null, updatedAt: null }));
      expect(new Date(dto.createdAt).toISOString()).toBe(dto.createdAt);
      expect(new Date(dto.updatedAt).toISOString()).toBe(dto.updatedAt);
    });
  });

  describe('seller', () => {
    it('carries the seller identity and rating', () => {
      const { seller } = serializeShoeListing(listingRow());
      expect(seller.id).toBe('user_1');
      expect(seller.name).toBe('Rainer');
      expect(seller.rating).toBe(4.5);
    });

    it('omits the rating for a seller with no ratings yet', () => {
      const row = listingRow();
      const dto = serializeShoeListing(listingRow({ seller: { ...row.seller, rating: null } }));
      expect(dto.seller.rating).toBeUndefined();
    });

    it('prefers the seller city as the location buyers see', () => {
      expect(serializeShoeListing(listingRow()).seller.location).toBe('Manila');
    });

    it('falls back to the address when there is no city', () => {
      const row = listingRow();
      const dto = serializeShoeListing(listingRow({ seller: { ...row.seller, city: null } }));
      expect(dto.seller.location).toBe('123 Taft Ave');
    });

    it('is null when the seller has neither', () => {
      const row = listingRow();
      const dto = serializeShoeListing(
        listingRow({ seller: { ...row.seller, city: null, address: null } })
      );
      expect(dto.seller.location).toBeNull();
    });
  });

  describe('fields with no backing column yet', () => {
    it('always reports freeShipping as false so the badge stays hidden', () => {
      expect(serializeShoeListing(listingRow()).freeShipping).toBe(false);
    });

    it('leaves swapFor undefined so swap cards fall back to "Open to offers"', () => {
      expect(serializeShoeListing(listingRow()).swapFor).toBeUndefined();
    });
  });
});
