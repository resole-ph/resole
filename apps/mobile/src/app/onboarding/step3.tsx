import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import OnboardingProgress from '@/components/molecules/OnboardingProgress';

export default function Step3Screen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const handleSkip = () => {
    router.push('/onboarding/auth');
  };

  return (
    <View className="flex-1 bg-surface">
      <View style={{ flex: 1 }}>
        <Image
          source={require('../../../assets/onboarding-step3.png')}
          className="w-full h-full"
          resizeMode="cover"
        />

        <View className="absolute inset-0">
          <OnboardingHeader showBack onBack={() => router.back()} onSkip={handleSkip} />
        </View>
      </View>

      <View
        className="bg-surface px-5 pt-6 items-center"
        style={{
          paddingBottom: 40 + bottom,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="bg-secondary-container rounded-full px-3 py-1 mb-4">
          <Text className="font-label-md text-label-md text-on-secondary-container uppercase tracking-widest">
            Step 3
          </Text>
        </View>

        <OnboardingProgress total={4} current={3} />

        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center mt-4 mb-3">
          The 30-Day Freshness Guarantee.
        </Text>
        <Text className="font-body-lg text-body-lg text-on-surface-variant text-center mb-6">
          Every listing gets 30 days to sell or swap. If it doesn't, easily
          choose to relist or donate it to our recycling partners.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/auth')}
          className="w-full bg-primary rounded-full py-4 flex-row items-center justify-center gap-2"
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
