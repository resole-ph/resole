import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/molecules/OnboardingHeader';
import { useOnboardingStore } from '@/store/onboarding';
import { PHILIPPINE_CITIES } from '@/data/philippineCities';
import { authService } from '@/features/auth/services/auth.service';

type Intent = 'buy' | 'sell' | 'donate';

const INTENT_OPTIONS: { id: Intent; icon: string; title: string; subtitle: string }[] = [
  { id: 'buy', icon: 'shopping-bag', title: 'Browse & Buy', subtitle: 'Find your next grail.' },
  { id: 'sell', icon: 'add-a-photo', title: 'Sell a Pair', subtitle: 'Clear out your closet.' },
  { id: 'donate', icon: 'volunteer-activism', title: 'Donate', subtitle: 'Give your kicks a second life.' },
];

export default function DetailsScreen() {
  const router = useRouter();
  const { userId: paramUserId, email: paramEmail } = useLocalSearchParams<{ userId: string; email: string }>();
  const { completeOnboarding, setIntent: storeSetIntent, setLocation, setPhoneNumber: storeSetPhone } = useOnboardingStore();

  const [intent, setIntent] = useState<Intent>('buy');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCities = citySearch.trim()
    ? PHILIPPINE_CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
    : PHILIPPINE_CITIES;

  const handleGetStarted = async () => {
    if (!paramUserId || !paramEmail) {
      setError('Session expired. Please sign in again.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      storeSetIntent(intent);
      setLocation(city);
      storeSetPhone(phone);
      await authService.saveProfile({
        id: paramUserId,
        name: paramEmail.split('@')[0],
        email: paramEmail,
        intent,
        contact_no: phone,
        city,
      });
      completeOnboarding();
      if (intent === 'buy') router.replace('/market');
      else if (intent === 'sell') router.replace('/sell');
      else router.replace('/');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingHeader
          showBack={router.canGoBack()}
          onBack={() => router.back()}
          logo
        />

        <View className="px-8 gap-8 mt-2">
          {/* Header */}
          <View className="items-center gap-1">
            <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
              One more thing
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant text-center">
              Tell us a little about yourself.
            </Text>
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

          {/* Phone number input */}
          <View className="gap-2">
            <Text className="font-body-md text-body-md text-on-surface text-center">
              What's your phone number?
            </Text>
            <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <View className="flex-row items-center gap-1 px-3 py-3 border-r border-outline-variant">
                <Text className="font-body-md text-body-md text-on-surface">🇵🇭</Text>
                <Text className="font-body-md text-body-md text-on-surface-variant">+63</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="9XX XXX XXXX"
                placeholderTextColor="#727687"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 py-3 px-3 font-body-md text-body-md text-on-surface"
              />
            </View>
          </View>

          {/* City picker */}
          <View className="gap-2">
            <Text className="font-body-md text-body-md text-on-surface text-center">
              Where are you located?
            </Text>
            <TouchableOpacity
              onPress={() => { setCitySearch(''); setCityPickerOpen(true); }}
              className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3"
            >
              <MaterialIcons name="location-on" size={18} color="#727687" />
              <Text
                className="flex-1 font-body-md text-body-md ml-2"
                style={{ color: city ? '#1a1c20' : '#727687' }}
              >
                {city || 'Select your city'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#727687" />
            </TouchableOpacity>
          </View>

          {error && (
            <Text className="font-body-sm text-body-sm text-error text-center">
              {error}
            </Text>
          )}

          {/* Get Started CTA */}
          <TouchableOpacity
            onPress={handleGetStarted}
            disabled={loading}
            className="self-center bg-primary rounded-full py-3 px-12 items-center"
            style={{
              opacity: loading ? 0.6 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 6,
            }}
          >
            <Text className="font-body-md text-body-md text-on-primary">
              {loading ? 'Saving…' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* City picker modal */}
      <Modal
        visible={cityPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCityPickerOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setCityPickerOpen(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' }}
        >
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' }} />
          </View>

          <Text className="font-title-md text-title-md text-on-surface text-center mb-3">
            Select your city
          </Text>

          <View className="mx-4 mb-3 flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-3">
            <MaterialIcons name="search" size={18} color="#727687" />
            <TextInput
              value={citySearch}
              onChangeText={setCitySearch}
              placeholder="Search city..."
              placeholderTextColor="#727687"
              autoFocus
              className="flex-1 py-3 px-2 font-body-md text-body-md text-on-surface"
            />
            {citySearch.length > 0 && (
              <TouchableOpacity onPress={() => setCitySearch('')}>
                <MaterialIcons name="close" size={18} color="#727687" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setCity(item); setCityPickerOpen(false); }}
                className="flex-row items-center px-5 py-3"
                style={{ backgroundColor: city === item ? '#f2f3ff' : 'transparent' }}
              >
                <MaterialIcons name="location-on" size={16} color={city === item ? '#0054d3' : '#727687'} />
                <Text
                  className="flex-1 font-body-md text-body-md ml-3"
                  style={{ color: city === item ? '#0054d3' : '#1a1c20' }}
                >
                  {item}
                </Text>
                {city === item && <MaterialIcons name="check" size={16} color="#0054d3" />}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 20 }} />
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
