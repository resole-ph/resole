import { Brand } from '../types/shoe.types';
import { apiFetch } from '@/lib/api-client';

export const ShoeService = {
  async getShoeBrands(): Promise<Brand[]> {
    const res = await apiFetch<{ brands: string[] }>(`/api/listings/brands`, {
      method: 'GET'
    });

    const uniqueBrandNames = new Set(
      res.brands.map((item: string) => 
        item.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
      )
    );

    return Array.from(uniqueBrandNames).map((brand) => ({
      id: brand,
      label: brand
    }));
  }
}