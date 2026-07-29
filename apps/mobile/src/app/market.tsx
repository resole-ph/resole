import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import FavoritesToggle from '@/components/organisms/FavoritesToggle';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import BottomNav from '@/components/organisms/BottomNav';
import SortSheet, { SortOption } from '@/components/organisms/SortSheet';
import FilterSheet, { MarketFilters, EMPTY_FILTERS } from '@/components/organisms/FilterSheet';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';

export default function MarketScreen() {
  const router = useRouter();

  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [swapListings, setSwapListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortVisible, setSortVisible] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    const filters = { brand: selectedBrand ?? undefined, search: searchQuery };

    const fetchSaleListings = async () => {
      try {
        const listings = await ListingService.getSaleListings(filters);
        setSaleListings(listings);
      } catch {
        setSaleListings([]);
      }
    }

    const fetchSwapListings = async () => {
      try {
        const listings = await ListingService.getSwapListings(filters);
        setSwapListings(listings);
      } catch {
        setSwapListings([]);
      }
    }

    fetchSaleListings();
    fetchSwapListings();
  }, [searchQuery, selectedBrand])

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar onSearch={setSearchQuery} />
        <FavoritesToggle active={favoritesOnly} onToggle={() => setFavoritesOnly((prev) => !prev)} />
        <CategoriesRow onBrandPress={setSelectedBrand} />
        <BrowseFeed
          title=""
          subtitle="Grab your pair at the best price"
          listings={visibleSaleListings}
          favoritesOnly={favoritesOnly}
          showFlashSale
          showFilters
          totalCount={visibleSaleListings.length}
          onSort={() => setSortVisible(true)}
          onFilter={() => setFilterVisible(true)}
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
