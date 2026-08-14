import { describe, expect, it } from 'vitest';
import { isListingFormValid, validateListingForm } from '@/features/sell/utils/validation';
import type { ListingFormData } from '@/features/sell/types/sell.types';

/**
 * Mobile's rules deliberately differ from web's: brand and model have a minimum
 * length, the size range is a flat 1–50 (the value is in whatever system the
 * user prefers, not the US Men anchor), and there is a price ceiling. Tested on
 * mobile's own terms rather than against the web bounds.
 */
function validForm(overrides: Partial<ListingFormData> = {}): ListingFormData {
  return {
    brand: 'Nike',
    model: 'Air Force 1',
    colorway: 'Triple White',
    size: '10',
    category: 'casual',
    year: '2021',
    conditionRating: 8.5,
    conditionLabel: 'Good',
    price: '4500',
    description: 'Lightly worn, no creasing.',
    mode: 'sell',
    ...overrides,
  };
}

describe('validateListingForm', () => {
  it('returns no errors for a complete, in-range form', () => {
    expect(validateListingForm(validForm())).toEqual({});
  });

  describe('brand and model', () => {
    it.each(['brand', 'model'] as const)('flags a missing %s', (field) => {
      expect(validateListingForm(validForm({ [field]: '' }))[field]).toBe(
        `${field[0].toUpperCase()}${field.slice(1)} is required.`
      );
    });

    it.each(['brand', 'model'] as const)('treats a whitespace-only %s as missing', (field) => {
      expect(validateListingForm(validForm({ [field]: '   ' }))[field]).toBeDefined();
    });

    it.each(['brand', 'model'] as const)('rejects a %s under three characters', (field) => {
      expect(validateListingForm(validForm({ [field]: 'ab' }))[field]).toBe(
        `${field[0].toUpperCase()}${field.slice(1)} must have at least 3 characters.`
      );
    });

    it.each(['brand', 'model'] as const)('accepts a %s of exactly three characters', (field) => {
      expect(validateListingForm(validForm({ [field]: 'abc' }))[field]).toBeUndefined();
    });

    it.each(['brand', 'model'] as const)('measures %s length after trimming', (field) => {
      expect(validateListingForm(validForm({ [field]: ' ab ' }))[field]).toBeDefined();
    });
  });

  describe('colorway', () => {
    it('is required but has no minimum length', () => {
      expect(validateListingForm(validForm({ colorway: '' })).colorway).toBe(
        'Colorway is required.'
      );
      expect(validateListingForm(validForm({ colorway: 'Red' })).colorway).toBeUndefined();
    });
  });

  describe('size', () => {
    it('flags a missing size', () => {
      expect(validateListingForm(validForm({ size: '' })).size).toBe('Size is required.');
    });

    it('flags a non-numeric size', () => {
      expect(validateListingForm(validForm({ size: 'ten' })).size).toBeDefined();
    });

    it('rejects a size outside the 1-50 range', () => {
      expect(validateListingForm(validForm({ size: '0' })).size).toBe(
        'Enter a valid size between 1 and 50.'
      );
      expect(validateListingForm(validForm({ size: '51' })).size).toBe(
        'Enter a valid size between 1 and 50.'
      );
    });

    it('accepts the range bounds', () => {
      expect(validateListingForm(validForm({ size: '1' })).size).toBeUndefined();
      expect(validateListingForm(validForm({ size: '50' })).size).toBeUndefined();
    });

    // The range is wide on purpose: the value is in the user's preferred system,
    // so it must accept EUR (~35-50) and Japan/CM (~22-34) as well as US/UK.
    it('accepts sizes from every supported system', () => {
      for (const size of ['10', '44', '9.5', '28']) {
        expect(validateListingForm(validForm({ size })).size).toBeUndefined();
      }
    });
  });

  describe('price', () => {
    it('flags a missing price', () => {
      expect(validateListingForm(validForm({ price: '' })).price).toBe('Price is required.');
    });

    it('rejects a free listing', () => {
      expect(validateListingForm(validForm({ price: '0' })).price).toBe(
        'Price must be greater than ₱0.'
      );
    });

    it('rejects a negative or non-numeric price', () => {
      expect(validateListingForm(validForm({ price: '-500' })).price).toBeDefined();
      expect(validateListingForm(validForm({ price: 'free' })).price).toBeDefined();
    });

    it('rejects a price above the ceiling', () => {
      expect(validateListingForm(validForm({ price: '100001' })).price).toBe(
        'Price must not exceed ₱100,000.'
      );
    });

    it('accepts the exact bounds', () => {
      expect(validateListingForm(validForm({ price: '1' })).price).toBeUndefined();
      expect(validateListingForm(validForm({ price: '100000' })).price).toBeUndefined();
    });
  });

  it('reports every broken field at once rather than stopping at the first', () => {
    const errors = validateListingForm(
      validForm({ brand: '', model: '', colorway: '', size: '', price: '' })
    );
    expect(Object.keys(errors).sort()).toEqual(['brand', 'colorway', 'model', 'price', 'size']);
  });
});

describe('isListingFormValid', () => {
  it('is true when there are no errors', () => {
    expect(isListingFormValid(validForm())).toBe(true);
  });

  it('is false when any field is invalid', () => {
    expect(isListingFormValid(validForm({ price: '100001' }))).toBe(false);
    expect(isListingFormValid(validForm({ brand: 'ab' }))).toBe(false);
  });
});
