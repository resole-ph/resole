import { Brand } from '../types/shoe.types';
import { apiFetch } from '@/lib/api-client';

export const ShoeService = {
  async getShoeBrands(): Promise<Brand[]> {
    const res = await apiFetch<{ brands: string[] }>(`/api/listings/brands`, {
      method: 'GET'
    });

    return res.brands.map((item: string) => {
      return {
        id: item,
        label: item
      }
    });
  }

}