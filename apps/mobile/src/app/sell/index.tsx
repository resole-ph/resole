import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSellFlow } from '@/features/sell/hooks/useSellFlow';
import PhotoUploadContainer from '@/features/sell/containers/PhotoUploadContainer';
import AiResultsContainer from '@/features/sell/containers/AiResultsContainer';
import EditListingContainer from '@/features/sell/containers/EditListingContainer';
import ReviewContainer from '@/features/sell/containers/ReviewContainer';
import ConfirmationContainer from '@/features/sell/containers/ConfirmationContainer';

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

      {__DEV__}
    </View>
  );
}
