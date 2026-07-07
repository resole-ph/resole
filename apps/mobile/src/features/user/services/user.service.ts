import { Listing } from '@/components/molecules/ListingCard';
import { apiFetch } from '@/lib/api-client';
import { UserStat, UserInfoCardProps } from '../types/user.types';

export const UserService = {
  async getUserInfoForCard(): Promise<UserInfoCardProps> {
    const userStats = await apiFetch<any>(`/api/users/me`, {
      method: 'GET'
    });

    const counters = await apiFetch<any>(`api/users/me/stats`, {
      method: 'GET'
    });

    const stats: UserStat[] = Object.keys(counters).map((key: string) => {
      return {
        value: counters[key],
        label: key
      }
    })

    return {
      name: userStats.name,
      initials: userStats.name.split(" ").map((item: string) => item.charAt(0)),
      rating: userStats.overllrating,
      reviewCount: userStats.reviewCount,
      location: userStats.location,
      joinYear: userStats.joinedYear,
      stats: stats
    };
  },

  async getUserListingSummary(model: string): Promise<Listing[]> {
    const res = await apiFetch<Listing[]>(`/api/listings/search?query=${model}`, {
      method: 'GET'
    });

    return res;
  },

  async getUserInfoForSettings(): Promise<any> {
    const userStats = await apiFetch<any>(`/api/users/me`, {
      method: 'GET'
    });

    return {
      name: userStats.name,
      email: userStats.email,
      phone: userStats.contactNo,
      location: userStats.location
    };
  },
}