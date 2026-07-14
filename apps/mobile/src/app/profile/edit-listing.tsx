import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSellFlow } from '@/features/sell/hooks/useSellFlow';
import { listingToEditState } from '@/features/sell/services/sell.service';
import { ListingService } from '@/features/listing/services/listing.service';
import PhotoUploadContainer from '@/features/sell/containers/PhotoUploadContainer';
import AiResultsContainer from '@/features/sell/containers/AiResultsContainer';
import EditListingContainer from '@/features/sell/containers/EditListingContainer';
import ReviewContainer from '@/features/sell/containers/ReviewContainer';
import ConfirmationContainer from '@/features/sell/containers/ConfirmationContainer';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { step, reset, loadListingForEdit } = useSellFlow();
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    reset();

    if (!id || loadedFor.current === id) return;
    loadedFor.current = id;

    setLoading(true);
    setLoadError(null);

    ListingService.getListingById(Number(id))
      .then((listing) => {
        const { photos, form } = listingToEditState(listing);
        loadListingForEdit(Number(id), photos, form);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load listing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#0054d3" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-8">
        <Text className="font-body-md text-body-md text-error text-center">{loadError}</Text>
      </View>
    );
  }

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
