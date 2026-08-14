'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileClient, type UpdateProfileInput } from '../services/profile.client';
import type { MyProfile } from '../types/profile.types';

/**
 * One place where every profile query key is spelled out.
 *
 * The keys matter more than the hooks: two components asking for
 * `profileKeys.myStats()` share a single cache entry and a single in-flight
 * request. Before this, UserInfoHeader and RecycleCoinsCard both fetched
 * /api/users/me/stats on the same page and neither knew the other existed.
 */
export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  myStats: () => [...profileKeys.all, 'me', 'stats'] as const,
  myListings: () => [...profileKeys.all, 'me', 'listings'] as const,
  myListingSummary: () => [...profileKeys.all, 'me', 'listings', 'summary'] as const,
  myFavourites: () => [...profileKeys.all, 'me', 'favourites'] as const,
  myTransactions: () => [...profileKeys.all, 'me', 'transactions'] as const,
  walletTransactions: () => [...profileKeys.all, 'me', 'wallet'] as const,
  redeemOptions: () => [...profileKeys.all, 'redeem-options'] as const,
  sellerAnalytics: () => [...profileKeys.all, 'me', 'seller-analytics'] as const,
  publicProfile: (userId: string) => [...profileKeys.all, 'public', userId] as const,
  userListings: (userId: string) => [...profileKeys.all, 'public', userId, 'listings'] as const,
  userReviews: (userId: string) => [...profileKeys.all, 'public', userId, 'reviews'] as const,
};

export function useMyProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => ProfileClient.getMyProfile(),
    enabled: options?.enabled ?? true,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: profileKeys.myStats(),
    queryFn: () => ProfileClient.getMyStats(),
  });
}

export function useMyListings(filters?: any) {
  return useQuery({
    queryKey: profileKeys.myListings(),
    queryFn: () => ProfileClient.getMyListings(filters),
  });
}

export function useMyListingSummary() {
  return useQuery({
    queryKey: profileKeys.myListingSummary(),
    queryFn: () => ProfileClient.getMyListingSummary(),
  });
}

export function useMyFavourites() {
  return useQuery({
    queryKey: profileKeys.myFavourites(),
    queryFn: () => ProfileClient.getMyFavourites(),
  });
}

export function useSellerAnalytics() {
  return useQuery({
    queryKey: profileKeys.sellerAnalytics(),
    queryFn: () => ProfileClient.getSellerAnalytics(),
  });
}

export function useMyTransactions() {
  return useQuery({
    queryKey: profileKeys.myTransactions(),
    queryFn: () => ProfileClient.getMyTransactions(),
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: profileKeys.walletTransactions(),
    queryFn: () => ProfileClient.getWalletTransactions(),
  });
}

export function useRedeemOptions() {
  return useQuery({
    queryKey: profileKeys.redeemOptions(),
    queryFn: () => ProfileClient.getRedeemOptions(),
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.publicProfile(userId),
    queryFn: () => ProfileClient.getPublicProfile(userId),
    enabled: Boolean(userId),
  });
}

export function useUserListings(userId: string) {
  return useQuery({
    queryKey: profileKeys.userListings(userId),
    queryFn: () => ProfileClient.getUserListings(userId),
    enabled: Boolean(userId),
  });
}

export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: profileKeys.userReviews(userId),
    queryFn: () => ProfileClient.getUserReviews(userId),
    enabled: Boolean(userId),
  });
}

/**
 * Writes the new profile straight into the cache rather than refetching.
 *
 * The merge is deliberate: PATCH returns the raw user row, which is missing the
 * fields the API derives on read (location, joinedYear, reviewCount). Replacing
 * the entry wholesale would blank those out in the header until the next fetch.
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => ProfileClient.updateMyProfile(input),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<MyProfile>(profileKeys.me(), (prev) =>
        prev
          ? { 
            ...prev, 
            ...updated, 
            name: variables.name ?? prev.name,
            location: variables.location ?? prev.location, 
            email: variables.email ?? prev.email,
            contactNo: variables.contactNo ?? prev.contactNo,
            unit: variables.unit ?? prev.unit, 
            classification: variables.classification ?? prev.classification, 
          }
          : prev
      );
      queryClient.invalidateQueries({ queryKey: profileKeys.myStats() });
    },
  });
}
