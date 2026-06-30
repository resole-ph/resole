import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import HeroBanner from '@/components/organisms/HeroBanner';
import BottomNav from '@/components/organisms/BottomNav';
import { MARKET_LISTINGS, SWAP_LISTINGS } from '@/data/MockListings';
export default function MarketScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <Header branded showInbox={false} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar />
        <CategoriesRow />
        <BrowseFeed
          title="Flash Sale"
          subtitle="Ends soon — grab your pair"
          listings={MARKET_LISTINGS}
          showFlashSale
          showFilters
          totalCount={126}
        />
        <BrowseFeed
          title="Swap Board"
          subtitle="Trade kicks with the community"
          listings={SWAP_LISTINGS}
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
