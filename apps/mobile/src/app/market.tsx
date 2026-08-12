import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import FavoritesToggle from '@/components/organisms/FavoritesToggle';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import BottomNav from '@/components/organisms/BottomNav';
import SortSheet, { SortOption } from '@/components/organisms/SortSheet';
import FilterSheet, { MarketFilters, EMPTY_FILTERS } from '@/components/organisms/FilterSheet';
import { Listing } from '@/components/molecules/ListingCard';
import { useSaleListings, useSwapListings } from '@/features/listing/queries/listing.queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function MarketScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortVisible, setSortVisible] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  // The search box updates on every keystroke; only the settled value reaches
  // the queries, so typing no longer fires a request per character.
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const listingFilters = useMemo(
    () => ({ category: selectedCat ?? undefined, brand: selectedBrand ?? undefined, search: debouncedSearch }),
    [selectedCat, selectedBrand, debouncedSearch]
  );

  const { data: saleData } = useSaleListings(listingFilters);
  const { data: swapData } = useSwapListings(listingFilters);

  // Both queries fell back to an empty list on failure before; unchanged.
  const saleListings: Listing[] = saleData ?? [];
  const swapListings: Listing[] = swapData ?? [];

  const sizeOptions = useMemo(
    () => Array.from(new Set(saleListings.map((l) => l.size).filter((s): s is string => !!s))).sort(
      (a, b) => Number(a) - Number(b)
    ),
    [saleListings]
  );

  const colorOptions = useMemo(
    () => Array.from(new Set(saleListings.map((l) => l.colorway).filter((c): c is string => !!c))).sort(),
    [saleListings]
  );

  const visibleSaleListings = useMemo(() => {
    let result = saleListings.filter((listing) => {
      if (filters.sizes.length && !(listing.size && filters.sizes.includes(listing.size))) return false;
      if (filters.colors.length && !(listing.colorway && filters.colors.includes(listing.colorway))) return false;
      if (filters.conditions.length && !filters.conditions.includes(listing.condition)) return false;
      if (filters.minRating && (listing.seller.rating ?? 0) < filters.minRating) return false;
      if (filters.priceMin && listing.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && listing.price > Number(filters.priceMax)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [saleListings, filters, sortOption]);

  return (
    <View className="flex-1 bg-gray-50">
      <Header branded showInbox onInboxPress={() => router.push('/inbox' as any)} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SearchBar
          onSearch={setSearchQuery}
          onSelectSeller={(personId) => router.push(`/profile/${personId}` as any)}
        />
        <CategoriesRow onCategoryPress={setSelectedCat} onBrandPress={setSelectedBrand} />
        <BrowseFeed
          title=""
          subtitle="Grab your pair at the best price"
          listings={visibleSaleListings}
          favoritesOnly={favoritesOnly}
          showFilters
          totalCount={visibleSaleListings.length}
          onSort={() => setSortVisible(true)}
          onFilter={() => setFilterVisible(true)}
          filterBarRight={
            <View className="ml-2">
              <FavoritesToggle
                active={favoritesOnly}
                onToggle={() => setFavoritesOnly((prev) => !prev)}
                compact
              />
            </View>
          }
        />
        <BrowseFeed
          title="Swap Board"
          subtitle="Trade kicks with the community"
          listings={swapListings}
          favoritesOnly={favoritesOnly}
        />
      </ScrollView>
      <BottomNav activeTab="market" onFabPress={() => router.push('/sell' as any)} />

      <SortSheet
        visible={sortVisible}
        value={sortOption}
        onSelect={setSortOption}
        onClose={() => setSortVisible(false)}
      />
      <FilterSheet
        visible={filterVisible}
        value={filters}
        sizeOptions={sizeOptions}
        colorOptions={colorOptions}
        onApply={setFilters}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}
