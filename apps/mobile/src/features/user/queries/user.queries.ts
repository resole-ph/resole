import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { ListingService } from '@/features/listing/services/listing.service';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import type { SizeSystem } from '@/features/shoe/utils/size-conversion';
import type { OwnedListingQuery } from '@/features/listing/types/listing.types';

function hasOwnedListingCriteria(filters?: OwnedListingQuery) {
  return !!filters && (
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.conditions.length > 0 ||
    filters.minRating !== null ||
    !!filters.priceMin ||
    !!filters.priceMax ||
    filters.sort !== 'newest'
  );
}

/**
 * Query keys for everything the profile tab reads.
 *
 * The QueryClient in src/queries has been mounted since the app was built, but
 * nothing used it — every screen fetched in a `useEffect` and threw the result
 * away on unmount, so popping back to a screen always refetched. These keys are
 * what let two screens share one entry.
 */
export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  card: (userId?: string) => [...userKeys.all, 'card', userId ?? 'me'] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  myListings: (filters?: OwnedListingQuery) => {
    const criteria = hasOwnedListingCriteria(filters) && filters
      ? [
          JSON.stringify([...filters.sizes].sort()),
          JSON.stringify([...filters.colors].sort()),
          JSON.stringify([...filters.conditions].sort()),
          filters.minRating ?? 'any-rating',
          filters.priceMin,
          filters.priceMax,
          filters.sort,
        ]
      : [];

    return [...userKeys.all, 'me', 'listings', ...criteria] as const;
  },
  favourites: () => [...userKeys.all, 'me', 'favourites'] as const,
  transactions: () => [...userKeys.all, 'me', 'transactions'] as const,
  coinBalance: () => [...userKeys.all, 'me', 'coins'] as const,
  walletTransactions: () => [...userKeys.all, 'me', 'wallet'] as const,
  vouchers: () => [...userKeys.all, 'me', 'vouchers'] as const,
};

/**
 * `enabled` exists for the home screen, which must not fetch until the
 * onboarding store has hydrated — an unauthenticated request before that
 * would fail and get cached as an error.
 */
export function useUserInfo(enabled = true) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => UserService.getUserInfo(),
    enabled,
  });
}

/** `userId` omitted means the signed-in user; passing one reads a public card. */
export function useUserInfoCard(userId?: string) {
  return useQuery({
    queryKey: userKeys.card(userId),
    queryFn: () =>
      userId ? UserService.getPublicUserInfoForCard(userId) : UserService.getUserInfoForCard(),
  });
}

export function useUserSettings() {
  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: () => UserService.getUserInfoForSettings(),
  });
}

export function useUpdateSizeSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sizeSystem: SizeSystem) => UserService.updateSizeSystem(sizeSystem),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.me(), user);
      queryClient.setQueryData(userKeys.settings(), {
        name: user.name,
        email: user.email,
        phone: user.contactNo,
        location: user.location,
      });
    },
  });
}

export function useMyListings(enabled = true, filters?: OwnedListingQuery) {
  return useQuery({
    queryKey: userKeys.myListings(filters),
    queryFn: () => ListingService.getUserListings(filters),
    enabled,
  });
}

export function useFavourites() {
  return useQuery({
    queryKey: userKeys.favourites(),
    queryFn: () => ListingService.getUserFavourites(),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: userKeys.transactions(),
    queryFn: () => TransactionService.getUserTransactions(),
  });
}

export function useCoinBalance() {
  return useQuery({
    queryKey: userKeys.coinBalance(),
    queryFn: () => TransactionService.getUserCoinBalance(),
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: userKeys.walletTransactions(),
    queryFn: () => TransactionService.getUserWalletTransactions(),
  });
}

export function useVouchers() {
  return useQuery({
    queryKey: userKeys.vouchers(),
    queryFn: () => TransactionService.getVouchers(),
  });
}
