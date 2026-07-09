import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import FavoritesToggle from '@/components/organisms/FavoritesToggle';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import HeroBanner from '@/components/organisms/HeroBanner';
import BottomNav from '@/components/organisms/BottomNav';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';

export default function MarketScreen() {
  const router = useRouter();

  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [swapListings, setSwapListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

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

  return (
    <View className="flex-1 bg-gray-50">
      <Header branded showInbox onInboxPress={() => router.push('/inbox' as any)} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar onSearch={setSearchQuery} />
        <FavoritesToggle active={favoritesOnly} onToggle={() => setFavoritesOnly((prev) => !prev)} />
        <CategoriesRow onBrandPress={setSelectedBrand} />
        <BrowseFeed
          title="For Sale"
          subtitle="Grab your pair at the best price"
          listings={saleListings}
          favoritesOnly={favoritesOnly}
          showFlashSale
          showFilters
          totalCount={saleListings.length}
        />
        <BrowseFeed
          title="Swap Board"
          subtitle="Trade kicks with the community"
          listings={swapListings}
          favoritesOnly={favoritesOnly}
        />
        <HeroBanner
          tag="LIMITED OFFER"
          title={"Claim your Free\nShipping Voucher"}
          subtitle="Valid for Metro Manila deliveries"
          ctaLabel="Claim Now"
          ctaVariant="pill"
          rightIcon="car-outline"
        />
      </ScrollView>
      <BottomNav activeTab="market" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
