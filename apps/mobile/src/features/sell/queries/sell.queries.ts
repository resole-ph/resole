import { useMutation } from '@tanstack/react-query';
import { sellService } from '../services/sell.service';
import type { PublishListingPayload, UpdateListingPayload } from '../types/sell.types';

export function usePublishListingMutation() {
  return useMutation({
    mutationFn: (payload: PublishListingPayload) => sellService.publishListing(payload),
  });
}

export function useUpdateListingMutation() {
  return useMutation({
    mutationFn: (payload: UpdateListingPayload) => sellService.updateListing(payload),
  });
}
