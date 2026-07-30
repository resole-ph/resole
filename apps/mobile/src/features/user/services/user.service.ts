import { apiFetch } from '@/lib/api-client';
import { UserStat, UserInfoCardProps, ListingSummary, FavouritesSummary, UserMetric } from '../types/user.types';

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

  async getUserSellerAnalytics(): Promise<UserMetric[]> {
    const { listingViews, profileViews, listingSaves } = await apiFetch<{ 
      listingViews: any,
      profileViews: any,
      listingSaves: any 
    }>(`/api/users/me/seller-analytics`, {
      method: 'GET'
    });

    let sellerAnalytics = [ listingViews, profileViews, listingSaves ];
    const labels = ['Listing Views', 'Profile Views', 'Listing Saves'];

    sellerAnalytics = sellerAnalytics.map((item, index) => {
      return {
        label: labels[index],
        value: item.total,
        delta: `${(item.thisWeek - item.lastWeek) / item.lastWeek}%`,
        up: item.thisWeek >= item.lastWeek
      };
    });
    
    return sellerAnalytics;
  } 
}