import { Charity } from '../types/charity.types';
import { apiFetch } from '@/lib/api-client';

export const CharityService = {
  async getCharities(): Promise<Charity[]> {
    const res = await apiFetch<{ charities: any[] }>(`api/charities`, {
      method: 'GET'
    });

    return res.charities.map((item: any): Charity => {
      return {
        id: item.id,
        name: item.name,
        cause: item.cause
      }
    })
  }
}