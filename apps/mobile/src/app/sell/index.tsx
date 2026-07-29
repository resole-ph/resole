import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellFlow } from '@/features/sell/hooks/useSellFlow';
import PhotoUploadContainer from '@/features/sell/containers/PhotoUploadContainer';
import AiResultsContainer from '@/features/sell/containers/AiResultsContainer';
import EditListingContainer from '@/features/sell/containers/EditListingContainer';
import ReviewContainer from '@/features/sell/containers/ReviewContainer';
import ConfirmationContainer from '@/features/sell/containers/ConfirmationContainer';

// TEMP: dev-only shortcut to step through the sell flow without shooting
// photos or waiting on a real AI analysis. Remove before shipping.
function DevNextButton() {
  const insets = useSafeAreaInsets();
  const { devAdvance, isLastStep } = useSellFlow();

  if (isLastStep) return null;

  return (
    <TouchableOpacity
      onPress={devAdvance}
      activeOpacity={0.8}
      style={{
        position: 'absolute',
        top: insets.top + 8,
        right: 12,
        zIndex: 50,
        backgroundColor: '#F59E0B',
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>DEV: Next →</Text>
    </TouchableOpacity>
  );
}

export default function SellScreen() {
  const { step, reset } = useSellFlow();

  useEffect(() => {
    reset();
  }, []);

  return (
    <View className="flex-1 bg-surface">
      {step === 'photos'       && <PhotoUploadContainer />}
      {step === 'aiResults'    && <AiResultsContainer />}
      {step === 'editListing'  && <EditListingContainer />}
      {step === 'review'       && <ReviewContainer />}
      {step === 'confirmation' && <ConfirmationContainer />}

      {__DEV__ && <DevNextButton />}
    </View>
  );
}
