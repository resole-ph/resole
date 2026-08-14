import { ScrollView, View, Text } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { useEffect, useState, useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import CharitiesSection from '@/components/organisms/CharitiesSection';
import { useOnboardingStore } from '@/store/onboarding';
import { useMyListings, useUserInfo } from '@/features/user/queries/user.queries';
import { Listing } from '@/components/molecules/ListingCard';
import { usePreferencesStore } from '@/store/preferences';
import { sizeSystemFromUserPreferences } from '@/features/shoe/utils/size-conversion';

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated()
  );
  const [searchQuery, setSearchQuery] = useState('');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (hydrated) return;
    return useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  // Both share their cache entries with the profile tab, so home -> profile
  // -> home costs no requests at all inside the stale window.
  const { data: userData } = useUserInfo(hydrated);
  const { data: listingsData } = useMyListings(!!userData);

  useEffect(() => {
    if (!userData) return;
    const accountSizeSystem = sizeSystemFromUserPreferences(
      userData.unit,
      userData.classification,
    );
    if (accountSizeSystem) {
      usePreferencesStore.getState().setSizeSystem(accountSizeSystem);
    }
  }, [userData]);

  const user = userData ?? { name: 'Resoler' };
  const myListings: Listing[] = Array.isArray(listingsData) ? listingsData : [];

  const filteredMyListings = useMemo(() => {
    if (!searchQuery) return myListings;
    const q = searchQuery.toLowerCase();
    return myListings.filter(
      (listing) =>
        listing.model?.toLowerCase().includes(q) ||
        listing.brand?.toLowerCase().includes(q)
    );
  }, [myListings, searchQuery]);

  if (!hydrated) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding/splash" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        onInboxPress={() => router.push('/inbox' as any)}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-3 pb-1">
          <Text className="text-2xl font-bold text-gray-900">{greeting}, {user.name}</Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your next pair today</Text>
        </View>

        <SearchBar
          onSearch={setSearchQuery}
          onSelectSeller={(personId) => router.push(`/profile/${personId}` as any)}
        />
        <HeroBanner onPress={() => router.push('/sell' as any)} />
        <BrowseFeed
          title="Your Listings"
          subtitle="Shoes you've put up for sale or swap"
          listings={filteredMyListings}
          onViewAll={() => router.push('/profile/listings' as any)}
        />
        <BrowseFeed
          title="Your Favorites"
          subtitle="Listings you've saved"
          favoritesOnly
          search={searchQuery}
          onViewAll={() => router.push('/profile/favourites' as any)}
        />
        <CharitiesSection />
        <HeroBanner
          tag="LIMITED OFFER"
          title={"Claim your Free\nShipping Voucher"}
          subtitle="Valid for Metro Manila deliveries"
          ctaLabel="Claim Now"
          ctaVariant="pill"
          rightIcon="car-outline"
          onPress={() => router.push('/rewards' as any)}
        />
      </ScrollView>
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
