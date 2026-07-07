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

  async getUserInfoForSettings(): Promise<any> {
    const userInfo = await apiFetch<any>(`/api/users/me`, {
      method: 'GET'
    });

    return {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.contactNo,
      location: userInfo.location
    };
  },

  async getUserStats(): Promise<any> {
    const userStats = await apiFetch<any>(`api/users/me/stats`, {
      method: 'GET'
    });

    return {
      "Pairs saved": userStats.pairsSaved,
      "Your coins": userStats.coinBalance,
      "Login streak": userStats.loginStreak
    }
  }
}