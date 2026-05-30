import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import OnboardingProgress from '@/components/molecules/OnboardingProgress';
import { useOnboardingStore } from '@/store/onboarding';

const ILLUSTRATION_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCfCGtzv4ECgUO2hP3eYyWMNohbT98eA__61UPQnylBcvC7DyRLElG0_S7GEn_WqE2hQ7ohKgQ9M656lxoPPdz1L97eM8ynMhUbLQuECWGcm8kVXeG_VlwWmNQci9azbaHv5F0FrwQk8IetDa-zF22AJyBBo9VluzUGASrg4n_t0xtIsllWmnpWx9AeYnniwuewDVcUGzjYrextsBru3uyVoAE1ofVBcHucKn7UJKrWPgNe1KpGLeWj9HwL_HbXexurSX9KQTgVJ8';

export default function Step3Screen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-surface">
      <View style={{ flex: 0.55, position: 'relative' }}>
        <Image
          source={{ uri: ILLUSTRATION_URI }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Gradient fade at bottom */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-surface"
          style={{ height: 80, opacity: 0.85 }}
        />

        {/* Floating glass calendar card */}
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ paddingTop: 48 }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              className="w-16 h-16 rounded-full bg-primary-container items-center justify-center"
              style={{
                shadowColor: '#0054d3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <MaterialIcons name="calendar-month" size={32} color="#ffffff" />
            </View>
            <Text className="font-title-md text-title-md text-primary">30 Days</Text>
          </View>
        </View>

        <View className="absolute inset-x-0 top-0">
          <OnboardingHeader showBack onBack={() => router.back()} onSkip={handleSkip} />
        </View>
      </View>

      <View
        className="bg-surface px-5 pt-6 pb-10 items-center"
        style={{
          flex: 0.45,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -40,
          zIndex: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.02,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <OnboardingProgress total={4} current={3} />

        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center mt-6 mb-3">
          The 30-Day Freshness Guarantee.
        </Text>
        <Text className="font-body-lg text-body-lg text-on-surface-variant text-center mb-8 max-w-xs">
          Every listing gets 30 days to sell or swap. If it doesn't, easily
          choose to relist or donate it to our recycling partners.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/auth')}
          className="w-full bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2"
          style={{
            shadowColor: '#0054d3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="font-label-md text-label-md text-on-primary uppercase tracking-wide">
            Next
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
