'use client';

import { useQuery } from '@tanstack/react-query';

export type ShoeSuggestion = { brand: string; model: string };
export type PersonSuggestion = { id: string; name: string };

export type SearchSuggestions = {
  shoes: ShoeSuggestion[];
  people: PersonSuggestion[];
};

export const searchKeys = {
  all: ['search-suggestions'] as const,
  suggestions: (query: string) => [...searchKeys.all, query] as const,
};

async function fetchSuggestions(query: string): Promise<SearchSuggestions> {
  const response = await fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load search suggestions');
  }

  return data ?? { shoes: [], people: [] };
}

/** Only fires once the query clears the same 2-char floor the API enforces. */
export function useSearchSuggestions(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: searchKeys.suggestions(trimmed),
    queryFn: () => fetchSuggestions(trimmed),
    enabled: trimmed.length >= 2,
    placeholderData: (prev) => prev,
  });
}
