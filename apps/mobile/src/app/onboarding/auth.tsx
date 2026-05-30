import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import { useOnboardingStore } from '@/store/onboarding';

type Intent = 'buy' | 'sell' | 'explore';

const INTENT_OPTIONS: { id: Intent; icon: string; title: string; subtitle: string }[] = [
  { id: 'buy', icon: 'shopping-bag', title: 'Browse & Buy', subtitle: 'Find your next grail.' },
  { id: 'sell', icon: 'add-a-photo', title: 'Sell a Pair', subtitle: 'Clear out your closet.' },
  { id: 'explore', icon: 'explore', title: 'Just Exploring', subtitle: "See what's trending." },
];

export default function AuthScreen() {
  const router = useRouter();
  const { completeOnboarding, setIntent: storeSetIntent, setLocation } = useOnboardingStore();
  const [intent, setIntent] = useState<Intent>('buy');
  const [location, setLocationInput] = useState('');

  const handleGetStarted = () => {
    storeSetIntent(intent);
    setLocation(location);
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <OnboardingHeader showBack onBack={() => router.back()} onSkip={handleSkip} title="Resole" />

      <View className="px-5 gap-10 mt-2">
        {/* Welcome section */}
        <View className="items-center gap-2">
          <Text className="font-headline-xl text-headline-xl text-on-surface text-center">
            Welcome to Resole
          </Text>
          <Text className="font-body-lg text-body-lg text-on-surface-variant text-center">
            Sign up to start swapping.
          </Text>
        </View>

        {/* Social auth buttons */}
        <View className="gap-2">
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-4 px-6 rounded-full bg-surface-container-lowest border border-outline-variant"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-google" size={20} color="#424655" />
            <Text className="font-title-md text-title-md text-on-surface">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-4 px-6 rounded-full"
            style={{
              backgroundColor: '#131b2e',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-apple" size={20} color="#ffffff" />
            <Text className="font-title-md text-title-md text-on-primary">
              Continue with Apple ID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-4 px-6 rounded-full"
            style={{
              backgroundColor: '#1877F2',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-facebook" size={20} color="#ffffff" />
            <Text className="font-title-md text-title-md text-on-primary">
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Intent selection */}
        <View className="gap-3">
          <Text className="font-title-md text-title-md text-on-surface text-center">
            What are you looking to do today?
          </Text>
          <View className="gap-2">
            {INTENT_OPTIONS.map((option) => {
              const selected = intent === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setIntent(option.id)}
                  className="flex-row items-center gap-4 p-4 rounded-3xl"
                  style={{
                    backgroundColor: selected ? '#f2f3ff' : '#ffffff',
                    borderWidth: 1,
                    borderColor: selected ? '#0054d3' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    elevation: 2,
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-secondary-container items-center justify-center">
                    <MaterialIcons name={option.icon as any} size={22} color="#0054d3" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-title-md text-title-md text-on-surface">
                      {option.title}
                    </Text>
                    <Text className="font-body-md text-body-md text-on-surface-variant">
                      {option.subtitle}
                    </Text>
                  </View>
                  {selected && (
                    <MaterialIcons name="check-circle" size={22} color="#0054d3" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location input */}
        <View className="gap-3">
          <Text className="font-title-md text-title-md text-on-surface text-center">
            Where are you located?
          </Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons
              name="location-on"
              size={20}
              color="#727687"
              style={{ position: 'absolute', left: 16, top: '50%', marginTop: -10, zIndex: 1 }}
            />
            <TextInput
              value={location}
              onChangeText={setLocationInput}
              placeholder="City or Region"
              placeholderTextColor="#727687"
              className="bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pr-4 font-body-md text-body-md text-on-surface"
              style={{ paddingLeft: 48 }}
            />
          </View>
        </View>

        {/* Get Started CTA */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className="w-full bg-primary rounded-full py-4 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          <Text className="font-title-md text-title-md text-on-primary">Get Started</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
