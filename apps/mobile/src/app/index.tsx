import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';
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
      <View className="flex-1" />
      {__DEV__ && (
        <TouchableOpacity
          onPress={handleResetOnboarding}
          style={{
            position: 'absolute',
            top: 60,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            zIndex: 999,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Reset Onboarding</Text>
        </TouchableOpacity>
      )}
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
