import { ScrollView, View, Text } from 'react-native';
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

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated()
  );
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
          <Text className="text-2xl font-bold text-gray-900">{greeting}</Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your next pair today</Text>
        </View>
        <SearchBar />
        <HeroBanner />
<CategoriesRow />
        <CharitiesSection />
        <BrowseFeed />
      </ScrollView>
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
