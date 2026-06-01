import { useMutation } from '@tanstack/react-query';
import { sellService } from '../services/sell.service';
import type { PublishListingPayload } from '../types/sell.types';

export function usePublishListingMutation() {
  return useMutation({
    mutationFn: (payload: PublishListingPayload) => sellService.publishListing(payload),
  });
}
