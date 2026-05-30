import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import OnboardingProgress from '@/components/molecules/OnboardingProgress';

export default function Step2Screen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const handleSkip = () => {
    router.push('/onboarding/auth');
  };

  return (
    <View className="flex-1 bg-surface">
      <View
        className="bg-surface-container-high items-center justify-center"
        style={{ flex: 1 }}
      >
        {/* Dotted grid background */}
        <View className="absolute inset-0 opacity-40">
          {Array.from({ length: 12 }, (_, row) => (
            <View key={row} className="flex-row" style={{ flex: 1 }}>
              {Array.from({ length: 8 }, (_, col) => (
                <View
                  key={col}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#9CA3AF' }}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ alignItems: 'center', gap: 24 }}>
          <Text style={{ fontSize: 80 }}>🤖</Text>

          {/* Valuation Complete chip */}
          <View
            className="flex-row items-center gap-2 rounded-full px-4 py-2 bg-surface"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color="#0054d3" />
            <Text className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
              Valuation Complete
            </Text>
          </View>
        </View>

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
            Step 2
          </Text>
        </View>

        <OnboardingProgress total={4} current={2} />

        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center mt-4 mb-3">
          Meet the AI Appraiser.
        </Text>
        <Text className="font-body-lg text-body-lg text-on-surface-variant text-center mb-6">
          No more guessing prices. Snap 4 quick photos, and our AI instantly
          calculates a fair local market value.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/step3')}
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
