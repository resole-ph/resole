import { View, Text, Image, ScrollView } from 'react-native';
import type { ListingFormData, SellPhoto, PhotoAngle } from '../types/sell.types';

const PHOTO_ANGLES: PhotoAngle[] = ['top', 'side', 'soles', 'insoles'];

const MODE_LABELS = { sell: 'Sell', swap: 'Swap', both: 'Sell & Swap' };

interface ListingPreviewCardProps {
  photos: Record<PhotoAngle, SellPhoto | null>;
  form: ListingFormData;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-2 border-b border-outline-variant">
      <Text className="font-label-md text-label-md text-on-surface-variant w-28">{label}</Text>
      <Text className="font-body-md text-body-md text-on-surface flex-1 text-right">{value}</Text>
    </View>
  );
}

export default function ListingPreviewCard({ photos, form }: ListingPreviewCardProps) {
  return (
    <View
      className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {/* Photo strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, padding: 12 }}
      >
        {PHOTO_ANGLES.map((angle) => {
          const photo = photos[angle];
          return (
            <View key={angle} className="rounded-xl overflow-hidden bg-surface-container">
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: 72, height: 72 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 72, height: 72 }} className="items-center justify-center">
                  <Text className="font-label-md text-label-md text-on-surface-variant">—</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Listing details */}
      <View className="px-4 pb-4">
        <FieldRow label="Brand" value={form.brand} />
        <FieldRow label="Model" value={form.model} />
        <FieldRow label="Colorway" value={form.colorway} />
        <FieldRow label="Size" value={form.size} />
        <FieldRow label="Year" value={form.year} />
        <FieldRow label="Condition" value={`${form.conditionLabel} (${form.conditionRating}/10)`} />
        <FieldRow label="Price" value={`₱${parseInt(form.price || '0').toLocaleString()}`} />
        <FieldRow label="Listing type" value={MODE_LABELS[form.mode]} />
        {form.description ? (
          <View className="pt-2">
            <Text className="font-label-md text-label-md text-on-surface-variant mb-1">
              Description
            </Text>
            <Text className="font-body-md text-body-md text-on-surface">{form.description}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
