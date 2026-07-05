import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
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

  useEffect(() => {
    const fetchSaleListings = async () => {
      const listings = await ListingService.getSaleListings();
      setSaleListings(listings);
    }

    const fetchSwapListings = async () => {
      const listings = await ListingService.getSwapListings();
      setSwapListings(listings);
    }

    fetchSaleListings();
    fetchSwapListings();
  })

  return (
    <View className="flex-1 bg-gray-50">
      <Header branded showInbox onInboxPress={() => router.push('/inbox' as any)} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar />
        <CategoriesRow />
        <BrowseFeed
          title="For Sale"
          subtitle="Grab your pair at the best price"
          listings={saleListings}
          showFlashSale
          showFilters
          totalCount={126}
        />
        <BrowseFeed
          title="Swap Board"
          subtitle="Trade kicks with the community"
          listings={swapListings}
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
