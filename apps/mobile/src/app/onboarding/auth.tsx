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

      <View className="px-8 gap-8 mt-2">
        {/* Welcome section */}
        <View className="items-center gap-1">
          <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
            Welcome to Resole
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant text-center">
            Sign up to start swapping.
          </Text>
        </View>

        {/* Social auth buttons */}
        <View className="gap-2">
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full bg-surface-container-lowest border border-outline-variant"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-google" size={18} color="#424655" />
            <Text className="font-body-md text-body-md text-on-surface">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full"
            style={{
              backgroundColor: '#131b2e',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-apple" size={18} color="#ffffff" />
            <Text className="font-body-md text-body-md text-on-primary">
              Continue with Apple ID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 py-3 px-5 rounded-full"
            style={{
              backgroundColor: '#1877F2',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Ionicons name="logo-facebook" size={18} color="#ffffff" />
            <Text className="font-body-md text-body-md text-on-primary">
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Intent selection */}
        <View className="gap-2">
          <Text className="font-body-md text-body-md text-on-surface text-center">
            What are you looking to do today?
          </Text>
          <View className="gap-2">
            {INTENT_OPTIONS.map((option) => {
              const selected = intent === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setIntent(option.id)}
                  className="flex-row items-center gap-3 p-3 rounded-3xl"
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
                  <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
                    <MaterialIcons name={option.icon as any} size={18} color="#0054d3" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-md text-body-md text-on-surface">
                      {option.title}
                    </Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      {option.subtitle}
                    </Text>
                  </View>
                  {selected && (
                    <MaterialIcons name="check-circle" size={18} color="#0054d3" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location input */}
        <View className="gap-2">
          <Text className="font-body-md text-body-md text-on-surface text-center">
            Where are you located?
          </Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons
              name="location-on"
              size={18}
              color="#727687"
              style={{ position: 'absolute', left: 14, top: '50%', marginTop: -9, zIndex: 1 }}
            />
            <TextInput
              value={location}
              onChangeText={setLocationInput}
              placeholder="City or Region"
              placeholderTextColor="#727687"
              className="bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pr-4 font-body-md text-body-md text-on-surface"
              style={{ paddingLeft: 44 }}
            />
          </View>
        </View>

        {/* Get Started CTA */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className="self-center bg-primary rounded-full py-3 px-12 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          <Text className="font-body-md text-body-md text-on-primary">Get Started</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
