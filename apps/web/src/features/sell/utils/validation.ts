import { MIN_US_MENS, MAX_US_MENS } from '@/features/shoe/utils/size-conversion';
import type { ListingFormData } from '../types/sell.types';

export interface ListingFormErrors {
  brand?: string;
  model?: string;
  colorway?: string;
  size?: string;
  price?: string;
}

// Sizes are stored as US Men's; bound the input to what the conversion chart
// covers so nothing unconvertible reaches the database.
const MIN_SIZE = MIN_US_MENS;
const MAX_SIZE = MAX_US_MENS;
const MIN_PRICE = 1;

export function validateListingForm(form: ListingFormData): ListingFormErrors {
  const errors: ListingFormErrors = {};

  if (!form.brand.trim()) errors.brand = 'Brand is required.';
  if (!form.model.trim()) errors.model = 'Model is required.';
  if (!form.colorway.trim()) errors.colorway = 'Colorway is required.';

  const size = Number(form.size);
  if (!form.size.trim()) {
    errors.size = 'Size is required.';
  } else if (!Number.isFinite(size) || size < MIN_SIZE || size > MAX_SIZE) {
    errors.size = `Enter a valid US Men's size between ${MIN_SIZE} and ${MAX_SIZE}.`;
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
