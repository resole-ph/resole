import { Charity } from '../types/charity.types';
import { apiFetch } from '@/lib/api-client';

export const CharityService = {
  async getCharities(): Promise<Charity[]> {
    const res = await apiFetch<any>(`api/charities`, {
      method: 'GET'
    });

    return res.map((item: any): Charity => {
      return {
        id: item.name.toLowerCase().replace(" ", "-"),
        name: item.name,
        cause: item.cause
      }
    })
  }
}