import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSellFlow } from '../hooks/useSellFlow';

export default function ConfirmationContainer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { publishedListing, reset } = useSellFlow();

  function handleGoHome() {
    reset();
    router.replace('/');
  }

  function handleViewListing() {
    if (publishedListing?.listingId) {
      router.push(`/listing/${publishedListing.listingId}` as any);
    }
  }

  return (
    <View
      className="flex-1 bg-surface items-center justify-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <View className="items-center gap-5 flex-1 justify-center">
        {/* Success icon */}
        <View
          className="w-24 h-24 rounded-full bg-secondary-container items-center justify-center"
          style={{
            shadowColor: '#0054d3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Ionicons name="checkmark-circle" size={64} color="#0054d3" />
        </View>

        <View className="items-center gap-2">
          <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
            Listing Published!
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant text-center">
            Your shoe is now live on the marketplace. Buyers will be able to find it shortly.
          </Text>
        </View>

        {publishedListing?.listingId && (
          <View className="bg-surface-container-low rounded-xl px-4 py-2">
            <Text className="font-label-md text-label-md text-on-surface-variant text-center">
              Listing ID
            </Text>
            <Text className="font-body-md text-body-md text-primary text-center">
              #{publishedListing.listingId}
            </Text>
          </View>
        )}
      </View>

      {/* CTAs */}
      <View className="w-full gap-3">
        {publishedListing?.listingId && (
          <TouchableOpacity
            onPress={handleViewListing}
            className="bg-primary rounded-full py-4 items-center"
            style={{
              shadowColor: '#0054d3',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text className="font-body-md text-body-md text-on-primary">View Listing</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleGoHome}
          className="rounded-full py-4 items-center border border-outline-variant"
        >
          <Text className="font-body-md text-body-md text-on-surface-variant">Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
