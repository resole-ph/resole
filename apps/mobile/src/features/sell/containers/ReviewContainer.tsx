import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import SellStepHeader from '../components/SellStepHeader';
import ListingPreviewCard from '../components/ListingPreviewCard';
import { useSellFlow } from '../hooks/useSellFlow';
import { usePublishListingMutation, useUpdateListingMutation } from '../queries/sell.queries';

export default function ReviewContainer() {
  const router = useRouter();
  const { photos, form, aiAnalysisId, flowMode, editingListingId, setPublishedListing, setStep, goBack } =
    useSellFlow();
  const { mutateAsync: publishListing, isPending: isPublishing } = usePublishListingMutation();
  const { mutateAsync: updateListing, isPending: isUpdating } = useUpdateListingMutation();
  const isEditing = flowMode === 'edit' && editingListingId != null;
  const isPending = isPublishing || isUpdating;
  const [publishError, setPublishError] = useState<string | null>(null);

  if (!form) return null;

  async function handlePublish() {
    if (!form) return;
    // Editing only re-runs the AI when photos changed; a fresh listing always
    // comes from an analysis, so it's required there but not here.
    if (!isEditing && !aiAnalysisId) return;
    setPublishError(null);

    const photoList = Object.values(photos)
      .filter(Boolean)
      .map((p) => ({ angle: p!.angle, remoteUrl: p!.remoteUrl ?? '' }));

    try {
      const result = isEditing
        ? await updateListing({ listingId: editingListingId!, photos: photoList, form })
        : await publishListing({ photos: photoList, form, aiAnalysisId: String(aiAnalysisId) });
      setPublishedListing(result);
      setStep('confirmation');
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : isEditing ? 'Failed to save changes' : 'Failed to publish listing'
      );
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <SellStepHeader
        title={isEditing ? 'Review Changes' : 'Review Listing'}
        stepLabel="Step 4 of 4"
        onBack={goBack}
        onClose={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="font-title-md text-title-md text-on-surface mb-1">
            Everything look right?
          </Text>
          <Text className="font-body-md text-body-md text-on-surface-variant">
            {isEditing
              ? 'Review your changes before saving them.'
              : 'Review your listing before it goes live.'}
          </Text>
        </View>

        <ListingPreviewCard photos={photos} form={form} />

        {publishError && (
          <View className="flex-row items-center gap-2 mt-4 p-3 rounded-xl bg-error-container">
            <MaterialIcons name="error-outline" size={18} color="#ba1a1a" />
            <Text className="font-body-md text-body-md text-on-error-container flex-1">
              {publishError}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CTAs */}
      <View className="px-4 pb-8 pt-2 gap-3">
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isPending}
          className="rounded-full py-4 items-center"
          style={{
            backgroundColor: isPending ? '#c2c6d8' : '#0054d3',
            shadowColor: isPending ? 'transparent' : '#0054d3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: isPending ? 0 : 6,
          }}
        >
          <Text
            className="font-body-md text-body-md"
            style={{ color: isPending ? '#727687' : '#ffffff' }}
          >
            {isEditing
              ? isPending ? 'Saving...' : 'Save Changes'
              : isPending ? 'Publishing...' : 'Publish Listing'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goBack}
          disabled={isPending}
          className="rounded-full py-4 items-center border border-outline-variant"
        >
          <Text className="font-body-md text-body-md text-on-surface-variant">Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
