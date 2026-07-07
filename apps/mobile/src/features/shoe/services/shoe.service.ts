import { Brand } from '../types/shoe.types';
import { apiFetch } from '@/lib/api-client';

export const ShoeService = {
  async getShoeBrands(): Promise<Brand[]> {
    const brands = await apiFetch<string[]>(`api/listings/brands`, {
      method: 'GET'
    });

    return brands.map((item: string) => {
      return {
        id: item.toLowerCase().replace(" ", "-"),
        label: item
      }
    });
  }

}