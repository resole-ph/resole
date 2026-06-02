import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import { useOnboardingStore } from '@/store/onboarding';

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    return useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  if (!hydrated) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding/step1" />;
  }

  const handleResetOnboarding = () => {
    useOnboardingStore.persist.clearStorage();
    useOnboardingStore.setState({ hasSeenOnboarding: false, intent: 'buy', location: '' });
    router.replace('/onboarding/step1');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar />
        <HeroBanner />
        <StatsRow />
        <CategoriesRow />
        <BrowseFeed />
      </ScrollView>
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
