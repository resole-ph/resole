import { apiFetch } from '@/lib/api-client';
import { UserStat, UserInfoCardProps, ListingSummary, FavouritesSummary, UserReview } from '../types/user.types';

const STAT_LABELS: Record<string, string> = {
  pairsSaved: 'Pairs saved',
  coinBalance: 'Your coins',
  loginStreak: 'Login streak',
};

export const UserService = {
  async getUserInfo(): Promise<any> {
    const { user } = await apiFetch<{ user: any }>(`/api/users/me`, {
      method: 'GET'
    });

    return user;
  },

  async getUserInfoForCard(): Promise<UserInfoCardProps> {
    const { user } = await apiFetch<{ user: any }>(`/api/users/me`, {
      method: 'GET'
    });

    const { userStats: counters } = await apiFetch<{ userStats: any }>(`/api/users/me/stats`, {
      method: 'GET'
    });

    const stats: UserStat[] = (['pairsSaved', 'coinBalance', 'loginStreak'] as const).map((key) => ({
      value: String(counters[key]),
      label: STAT_LABELS[key],
    }));

    return {
      name: user.name,
      initials: user.name
        .split(' ')
        .map((item: string) => item.charAt(0))
        .join('')
        .toUpperCase(),
      rating: user.overallRating,
      reviewCount: user.reviewCount,
      location: user.location,
      joinYear: user.joinedYear,
      stats: stats
    };
  },

  async getUserInfoForSettings(): Promise<any> {
    const { user } = await apiFetch<{ user: any }>(`/api/users/me`, {
      method: 'GET'
    });

    return {
      name: user.name,
      email: user.email,
      phone: user.contactNo,
      location: user.location,
      unit: user.unit ?? 'us',
      classification: user.classification ?? 'men'
    };
  },

  async getUserStats(): Promise<any> {
    const { userStats } = await apiFetch<{ userStats: any }>(`/api/users/me/stats`, {
      method: 'GET'
    });

    return {
      "Pairs saved": userStats.pairsSaved,
      "Your coins": userStats.coinBalance,
      "Login streak": userStats.loginStreak
    }
  },

  async getListingSummary(): Promise<ListingSummary> {
    const { listingSummary } = await apiFetch<{ listingSummary: ListingSummary }>(`/api/users/me/listings/summary`, {
      method: 'GET'
    });

    return listingSummary;
  },

  async getFavouritesSummary(): Promise<FavouritesSummary> {
    const { totalCount } = await apiFetch<{ totalCount: number }>(`/api/users/me/favourites`, {
      method: 'GET'
    });

    return { totalCount };
  },

  /** Public profile of another user — narrower than `getUserInfoForCard`, no contact/account details. */
  async getPublicUserInfoForCard(userId: string): Promise<UserInfoCardProps> {
    const { user } = await apiFetch<{ user: any }>(`/api/users/${userId}`, {
      method: 'GET'
    });

    const stats: UserStat[] = [
      { value: String(user.listingCount ?? 0), label: 'Listings' },
      { value: String(user.salesCount ?? 0), label: 'Sales' },
      { value: String(user.swapsCount ?? 0), label: 'Swaps' },
    ];

    return {
      name: user.name,
      initials: user.name
        .split(' ')
        .map((item: string) => item.charAt(0))
        .join('')
        .toUpperCase(),
      rating: user.overallRating ?? 0,
      reviewCount: user.reviewCount ?? 0,
      location: user.location ?? '',
      joinYear: user.joinedYear ?? 0,
      stats: stats
    };
  },

  async getUserReviews(userId: string): Promise<UserReview[]> {
    const { reviews } = await apiFetch<{ reviews: UserReview[] }>(`/api/users/${userId}/reviews`, {
      method: 'GET'
    });

    return reviews;
  }
}