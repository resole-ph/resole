import { useEffect } from 'react';
import { View } from 'react-native';
import { useSellFlow } from '@/features/sell/hooks/useSellFlow';
import PhotoUploadContainer from '@/features/sell/containers/PhotoUploadContainer';
import AiResultsContainer from '@/features/sell/containers/AiResultsContainer';
import EditListingContainer from '@/features/sell/containers/EditListingContainer';
import ReviewContainer from '@/features/sell/containers/ReviewContainer';
import ConfirmationContainer from '@/features/sell/containers/ConfirmationContainer';

export default function SellScreen() {
  const { step, flowMode, reset } = useSellFlow();

  useEffect(() => {
    // A leftover "editing an existing listing" session must never bleed into
    // a fresh listing here — that would silently PATCH the wrong listing.
    if (flowMode === 'edit') reset();
  }, []);

  return (
    <View className="flex-1 bg-surface">
      {step === 'photos'       && <PhotoUploadContainer />}
      {step === 'aiResults'    && <AiResultsContainer />}
      {step === 'editListing'  && <EditListingContainer />}
      {step === 'review'       && <ReviewContainer />}
      {step === 'confirmation' && <ConfirmationContainer />}
    </View>
  );
}
