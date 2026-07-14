import type { ListingFormData } from '../types/sell.types';

export interface ListingFormErrors {
  brand?: string;
  model?: string;
  colorway?: string;
  size?: string;
  year?: string;
  price?: string;
}

const MIN_SIZE = 1;
const MAX_SIZE = 20;
const MIN_YEAR = 1900;
const MIN_PRICE = 1;

export function validateListingForm(form: ListingFormData): ListingFormErrors {
  const errors: ListingFormErrors = {};
  const currentYear = new Date().getFullYear();

  if (!form.brand.trim()) errors.brand = 'Brand is required.';
  if (!form.model.trim()) errors.model = 'Model is required.';
  if (!form.colorway.trim()) errors.colorway = 'Colorway is required.';

  const size = Number(form.size);
  if (!form.size.trim()) {
    errors.size = 'Size is required.';
  } else if (!Number.isFinite(size) || size < MIN_SIZE || size > MAX_SIZE) {
    errors.size = `Enter a valid size between ${MIN_SIZE} and ${MAX_SIZE}.`;
  }

  // Year is only known when the AI has analyzed photos this session — existing
  // published listings don't store one, so it's optional when editing them.
  if (form.year.trim()) {
    const year = Number(form.year);
    if (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear) {
      errors.year = `Enter a valid year (${MIN_YEAR}–${currentYear}).`;
    }
  }

  const price = Number(form.price);
  if (!form.price.trim()) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(price) || price < MIN_PRICE) {
    errors.price = 'Price must be greater than ₱0.';
  }

  return errors;
}

export function isListingFormValid(form: ListingFormData): boolean {
  return Object.keys(validateListingForm(form)).length === 0;
}
