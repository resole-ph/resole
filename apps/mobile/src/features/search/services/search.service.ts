import { apiFetch } from '@/lib/api-client';

export type ShoeSuggestion = { brand: string; model: string };
export type PersonSuggestion = { id: string; name: string };

export type SearchSuggestions = {
  shoes: ShoeSuggestion[];
  people: PersonSuggestion[];
};

export const SearchService = {
  async getSuggestions(query: string): Promise<SearchSuggestions> {
    if (query.trim().length < 2) {
      return { shoes: [], people: [] };
    }

    const res = await apiFetch<SearchSuggestions>(
      `api/search/suggestions?query=${encodeURIComponent(query.trim())}`,
      { method: 'GET', cacheTtl: 0 }
    );

    return { shoes: res.shoes ?? [], people: res.people ?? [] };
  },
};
