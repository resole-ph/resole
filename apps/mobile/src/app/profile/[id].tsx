import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import UserInfoCard from '@/components/organisms/UserInfoCard';
import ListingCard, { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';
import { UserService } from '@/features/user/services/user.service';
import { UserReview } from '@/features/user/types/user.types';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

const REVIEWS_PREVIEW_COUNT = 3;

function ReviewRow({ review }: { review: UserReview }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5" style={CARD_SHADOW}>
      <View className="flex-row items-center mb-2">
        <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mr-2.5">
          <Text className="text-blue-600 text-xs font-bold">
            {review.rater.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-sm">{review.rater.name}</Text>
          <Text className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text className="text-gray-700 text-xs font-semibold ml-1">{review.rating}</Text>
        </View>
      </View>
      {review.comment && (
        <Text className="text-gray-600 text-sm leading-relaxed">{review.comment}</Text>
      )}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-gray-900 font-bold text-base mx-5 mb-3">{title}</Text>
  );
}

function EmptyState({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="items-center py-10">
      <Ionicons name={icon} size={40} color="#D1D5DB" />
      <Text className="text-gray-400 text-sm mt-3">{label}</Text>
    </View>
  );
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const [listingsData, reviewsData] = await Promise.all([
          ListingService.getUserListingsById(id),
          UserService.getUserReviews(id),
        ]);
        setListings(listingsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load public profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const trackView = async () => {
      try {
        await new Promise(r => setTimeout(r, 5000));
        await UserService.saveUserView(id);
      } catch (error) {
        console.error('Analytics error - failed to track view:', error);
      }
    };

    trackView();
  }, [id]);

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, REVIEWS_PREVIEW_COUNT);

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <UserInfoCard userId={id} />

        {isLoading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 24 }} />
        ) : (
          <>
            <SectionHeader title={`Reviews (${reviews.length})`} />
            {reviews.length === 0 ? (
              <EmptyState icon="star-outline" label="No reviews yet" />
            ) : (
              <>
                {visibleReviews.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))}
                {!showAllReviews && reviews.length > REVIEWS_PREVIEW_COUNT && (
                  <GuardedTouchableOpacity
                    className="flex-row items-center justify-center mx-5 mb-2 py-2.5 rounded-xl bg-white border border-gray-200"
                    activeOpacity={0.7}
                    onPress={() => setShowAllReviews(true)}
                  >
                    <Text className="text-blue-600 font-semibold text-sm mr-1">
                      View more reviews ({reviews.length - REVIEWS_PREVIEW_COUNT})
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#2563EB" />
                  </GuardedTouchableOpacity>
                )}
              </>
            )}

            <View className="h-px bg-gray-100 mx-5 my-5" />

            <SectionHeader title={`Active Listings (${listings.length})`} />
            {listings.length === 0 ? (
              <EmptyState icon="cube-outline" label="No active listings" />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 }}>
                {listings.map((item) => (
                  <View key={item.id} style={{ width: '50%', padding: 5 }}>
                    <ListingCard listing={item} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
