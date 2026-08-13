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
// Wide enough to cover any supported size system (EUR ~35-48, US/UK ~4-15,
// Japan/CM ~20-32) since the value here is in whatever system the user prefers.
const MAX_SIZE = 50;
const MIN_YEAR = 1900;
const MIN_PRICE = 1;
const MAX_PRICE = 100000;

export function validateListingForm(form: ListingFormData): ListingFormErrors {
  const errors: ListingFormErrors = {};
  const currentYear = new Date().getFullYear();

  if (!form.brand.trim()) errors.brand = 'Brand is required.';
  else if (form.brand.trim().length < 3) errors.brand = 'Brand must have at least 3 characters.';

  if (!form.model.trim()) errors.model = 'Model is required.';
  else if (form.model.trim().length < 3) errors.model = 'Model must have at least 3 characters.';
  
  if (!form.colorway.trim()) errors.colorway = 'Colorway is required.';

  const size = Number(form.size);
  if (!form.size.trim()) {
    errors.size = 'Size is required.';
  } else if (!Number.isFinite(size) || size < MIN_SIZE || size > MAX_SIZE) {
    errors.size = `Enter a valid size between ${MIN_SIZE} and ${MAX_SIZE}.`;
  }

  const price = Number(form.price);
  if (!form.price.trim()) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(price) || price < MIN_PRICE) {
    errors.price = 'Price must be greater than ₱0.';
  } else if (price > MAX_PRICE) {
    errors.price = 'Price must not exceed ₱100,000.'
  }

  return errors;
}

export function isListingFormValid(form: ListingFormData): boolean {
  return Object.keys(validateListingForm(form)).length === 0;
}
