import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import CharitiesSection from '@/components/organisms/CharitiesSection';
import { useOnboardingStore } from '@/store/onboarding';
import { UserService } from '@/features/user/services/user.service';

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated()
  );
  const [user, setUser] = useState<any>({ name: 'Resoler' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

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

  useEffect(() => {
    if (!hydrated) return; 

    const getUser = async () => {
      try {
        const data = await UserService.getUserInfo();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    getUser();
  }, [hydrated]);

  if (!hydrated) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding/splash" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        onInboxPress={() => router.push('/inbox' as any)}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-3 pb-1">
          <Text className="text-2xl font-bold text-gray-900">{greeting}, {user.name}</Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your next pair today</Text>
        </View>
        {/* TEMP: preview onboarding flow, remove before shipping */}
        <TouchableOpacity
          onPress={() => router.push('/onboarding/splash')}
          className="mx-5 mb-2 self-start rounded-full bg-gray-200 px-3 py-1.5"
        >
          <Text className="text-xs text-gray-600">Preview Onboarding</Text>
        </TouchableOpacity>
        <SearchBar onSearch={setSearchQuery} />
        <HeroBanner />
        <CategoriesRow onBrandPress={setSelectedBrand} />
        <CharitiesSection />
        <BrowseFeed
          title={searchQuery ? `Results for "${searchQuery}"` : 'Listings'}
          subtitle={selectedBrand ? `Filtered by ${selectedBrand}` : 'Kickstart your day'}
          brand={selectedBrand}
          search={searchQuery}
        />
      </ScrollView>
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
