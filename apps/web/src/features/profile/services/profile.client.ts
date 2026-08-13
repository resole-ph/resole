import type {
  FavouriteItem,
  ListingSummary,
  MyProfile,
  ProfileListing,
  PublicProfile,
  RedeemOptionRow,
  SellerAnalytics,
  TransactionRow,
  UserReview,
  UserStats,
  WalletTransactionRow,
} from '../types/profile.types';

/**
 * Browser-side profile client. Same-origin `fetch`, so the `session` cookie
 * rides along automatically — the same routes the mobile app consumes.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed: ${path}`);
  }

  return data as T;
}

export function initialsOf(name: string | null | undefined): string {
  if (!name?.trim()) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export type UpdateProfileInput = {
  name?: string;
  location?: string;
  image?: string;
  email?: string;
  contactNo?: string;
  unit?: string;
  classification?: string;
};

export const ProfileClient = {
  getMyProfile() {
    return request<{ user: MyProfile }>('/api/users/me').then((data) => data.user);
  },

  getMyStats() {
    return request<{ userStats: UserStats }>('/api/users/me/stats').then((data) => data.userStats);
  },

  updateMyProfile(input: UpdateProfileInput) {
    const body = {
      name: input.name ?? undefined,
      city: input.location ?? undefined,
      image: input.image ?? '',
      email: input.email ?? undefined,
      contactNo: input.contactNo ?? undefined,
      unit: input.unit ?? undefined,
      classification: input.classification ?? undefined
    }

    return request<{ user: MyProfile }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((data) => data.user);
  },

  getMyListings() {
    return request<{ shoeListings: ProfileListing[] }>('/api/users/me/listings').then(
      (data) => data.shoeListings ?? []
    );
  },

  getMyListingSummary() {
    return request<{ listingSummary: ListingSummary }>('/api/users/me/listings/summary').then(
      (data) => data.listingSummary
    );
  },

  getMyFavourites() {
    return request<{ totalCount: number; favourites: FavouriteItem[] }>(
      '/api/users/me/favourites'
    );
  },

  getSellerAnalytics() {
    return request<SellerAnalytics>('/api/users/me/seller-analytics');
  },

  getMyTransactions() {
    return request<{ transactions: TransactionRow[] }>('/api/users/me/transactions').then(
      (data) => data.transactions ?? []
    );
  },

  getWalletTransactions() {
    return request<{ transactions: WalletTransactionRow[] }>('/api/wallet/transactions').then(
      (data) => data.transactions ?? []
    );
  },

  getRedeemOptions() {
    return request<{ redeemOptions: RedeemOptionRow[] }>('/api/rewards/redeem-options').then(
      (data) => data.redeemOptions ?? []
    );
  },

  getPublicProfile(userId: string) {
    return request<{ user: PublicProfile }>(`/api/users/${userId}`).then((data) => data.user);
  },

  getUserReviews(userId: string) {
    return request<{ reviews: UserReview[] }>(`/api/users/${userId}/reviews`).then(
      (data) => data.reviews ?? []
    );
  },

  getUserListings(userId: string) {
    return request<{ shoeListings: ProfileListing[] }>(`/api/users/${userId}/listings`).then(
      (data) => data.shoeListings ?? []
    );
  },

  updatePassword(body: {currentPassword: string, newPassword: string}) {
    return request(`/api/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
};
