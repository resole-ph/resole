import {
  ANCHOR_SYSTEM,
  MAX_US_MENS,
  MIN_US_MENS,
  SIZE_SYSTEM_LABELS,
  convertFromUSMens,
  type SizeSystem,
} from '@/features/shoe/utils/size-conversion';
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
const MIN_PRICE = 1;

export function validateListingForm(
  form: ListingFormData,
  sizeSystem: SizeSystem = ANCHOR_SYSTEM
): ListingFormErrors {
  const errors: ListingFormErrors = {};

  if (!form.brand.trim()) errors.brand = 'Brand is required.';
  if (!form.model.trim()) errors.model = 'Model is required.';
  if (!form.colorway.trim()) errors.colorway = 'Colorway is required.';

  const size = Number(form.size);
  const minSize = convertFromUSMens(MIN_US_MENS, sizeSystem);
  const maxSize = convertFromUSMens(MAX_US_MENS, sizeSystem);
  if (!form.size.trim()) {
    errors.size = 'Size is required.';
  } else if (!Number.isFinite(size) || size < minSize || size > maxSize) {
    errors.size = `Enter a valid ${SIZE_SYSTEM_LABELS[sizeSystem]} size between ${minSize} and ${maxSize}.`;
  }

  const price = Number(form.price);
  if (!form.price.trim()) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(price) || price < MIN_PRICE) {
    errors.price = 'Price must be greater than ₱0.';
  }

  return errors;
}

export function isListingFormValid(form: ListingFormData, sizeSystem?: SizeSystem): boolean {
  return Object.keys(validateListingForm(form, sizeSystem)).length === 0;
}
