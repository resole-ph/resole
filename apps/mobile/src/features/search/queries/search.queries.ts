import { useQuery } from '@tanstack/react-query';
import { SearchService } from '../services/search.service';

export const searchKeys = {
  all: ['search-suggestions'] as const,
  suggestions: (query: string) => [...searchKeys.all, query] as const,
};

/** Only fires once the query clears the same 2-char floor the API enforces. */
export function useSearchSuggestions(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: searchKeys.suggestions(trimmed),
    queryFn: () => SearchService.getSuggestions(trimmed),
    enabled: trimmed.length >= 2,
    placeholderData: (prev) => prev,
  });
}
