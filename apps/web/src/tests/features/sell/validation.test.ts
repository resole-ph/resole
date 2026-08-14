import { describe, expect, it } from 'vitest';
import { isListingFormValid, validateListingForm } from '@/features/sell/utils/validation';
import type { ListingFormData } from '@/features/sell/types/sell.types';

/** A form that passes every rule; each test overrides just the field it exercises. */
function validForm(overrides: Partial<ListingFormData> = {}): ListingFormData {
  return {
    brand: 'Nike',
    model: 'Air Force 1',
    category: 'casual',
    colorway: 'Triple White',
    size: '10',
    conditionScore: 8.5,
    price: '4500',
    description: 'Lightly worn, no creasing.',
    isRefurbished: false,
    listingMode: 'sale',
    ...overrides,
  };
}

describe('validateListingForm', () => {
  it('returns no errors for a complete, in-range form', () => {
    expect(validateListingForm(validForm())).toEqual({});
  });

  describe('required text fields', () => {
    it.each(['brand', 'model', 'colorway'] as const)('flags a missing %s', (field) => {
      const errors = validateListingForm(validForm({ [field]: '' }));
      expect(errors[field]).toBeDefined();
    });

    it.each(['brand', 'model', 'colorway'] as const)('treats a whitespace-only %s as missing', (field) => {
      const errors = validateListingForm(validForm({ [field]: '   ' }));
      expect(errors[field]).toBeDefined();
    });

    it('reports only the field that is actually missing', () => {
      expect(validateListingForm(validForm({ brand: '' }))).toEqual({
        brand: 'Brand is required.',
      });
    });
  });

  describe('size', () => {
    it('flags a missing size', () => {
      expect(validateListingForm(validForm({ size: '' })).size).toBe('Size is required.');
    });

    it('flags a non-numeric size', () => {
      expect(validateListingForm(validForm({ size: 'ten' })).size).toBeDefined();
    });

    it('rejects a size below what the conversion chart covers', () => {
      expect(validateListingForm(validForm({ size: '2' })).size).toBe(
        'Enter a valid US Men size between 3 and 16.'
      );
    });

    it('rejects a size above what the conversion chart covers', () => {
      expect(validateListingForm(validForm({ size: '17' })).size).toBe(
        'Enter a valid US Men size between 3 and 16.'
      );
    });

    it('accepts the exact chart bounds', () => {
      expect(validateListingForm(validForm({ size: '3' })).size).toBeUndefined();
      expect(validateListingForm(validForm({ size: '16' })).size).toBeUndefined();
    });

    // The bounds are derived per system, so the same number is valid in one
    // system and out of range in another. Getting this wrong would reject every
    // EUR seller's size.
    it('accepts an EUR size when validating in EUR', () => {
      expect(validateListingForm(validForm({ size: '44' }), 'eur').size).toBeUndefined();
    });

    it('rejects that same EUR size when validating in US Men', () => {
      expect(validateListingForm(validForm({ size: '44' }), 'us_m').size).toBeDefined();
    });

    it('rejects a US Men size when validating in EUR, and names EUR in the message', () => {
      expect(validateListingForm(validForm({ size: '10' }), 'eur').size).toBe(
        'Enter a valid EUR size between 35 and 50.'
      );
    });

    it('names the Japan/CM bounds when validating in centimetres', () => {
      expect(validateListingForm(validForm({ size: '10' }), 'jp_cm').size).toBe(
        'Enter a valid Japan/CM size between 22 and 34.'
      );
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

    it('rejects a negative price', () => {
      expect(validateListingForm(validForm({ price: '-500' })).price).toBeDefined();
    });

    it('rejects a price below one peso', () => {
      expect(validateListingForm(validForm({ price: '0.5' })).price).toBeDefined();
    });

    it('rejects a non-numeric price', () => {
      expect(validateListingForm(validForm({ price: 'free' })).price).toBeDefined();
    });

    it('accepts exactly one peso', () => {
      expect(validateListingForm(validForm({ price: '1' })).price).toBeUndefined();
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
    expect(isListingFormValid(validForm({ price: '0' }))).toBe(false);
  });

  it('honours the size system it is given', () => {
    expect(isListingFormValid(validForm({ size: '44' }), 'eur')).toBe(true);
    expect(isListingFormValid(validForm({ size: '44' }), 'us_m')).toBe(false);
  });
});
