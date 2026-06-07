import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import HeroBanner from '@/components/organisms/HeroBanner';
import BottomNav from '@/components/organisms/BottomNav';
import { MARKET_LISTINGS, SWAP_LISTINGS } from '@/data/MockListings';
import { useCartStore } from '@/store/cart';
import { useNotificationsStore } from '@/store/notifications';

export default function MarketScreen() {
  const router = useRouter();
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const unreadCount = useNotificationsStore((s) =>
    s.notifications.filter((n) => !n.read).length,
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        branded
        showInbox={false}
        showCart
        cartCount={cartCount}
        notificationCount={unreadCount}
        onCartPress={() => router.push('/cart')}
        onNotificationPress={() => router.push('/notifications' as any)}
      />
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
