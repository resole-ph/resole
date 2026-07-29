import { View, Text, Image } from 'react-native';
import type { ListingFormData, SellPhoto, PhotoAngle } from '../types/sell.types';
import { usePreferencesStore } from '@/store/preferences';
import { SIZE_SYSTEM_LABELS } from '@/features/shoe/utils/size-conversion';

const PHOTO_ANGLES: PhotoAngle[] = ['top', 'leftSide', 'rightSide', 'sole', 'insoleRight', 'insoleLeft'];

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
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
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
      {/* 3×2 photo grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, padding: 12 }}>
        {PHOTO_ANGLES.map((angle) => {
          const photo = photos[angle];
          return (
            <View
              key={angle}
              style={{ width: '31.5%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}
              className="bg-surface-container"
            >
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: '100%', height: '100%' }} className="items-center justify-center">
                  <Text className="font-label-md text-label-md text-on-surface-variant">—</Text>
                </View>
              )}
              <View className="absolute bottom-1.5 left-1.5 bg-black/50 rounded-full px-2 py-0.5">
                <Text className="font-label-md text-label-md text-white capitalize">{angle}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Listing details */}
      <View className="px-4 pb-4">
        <FieldRow label="Brand" value={form.brand} />
        <FieldRow label="Model" value={form.model} />
        <FieldRow label="Colorway" value={form.colorway} />
        <FieldRow label={`Size (${SIZE_SYSTEM_LABELS[sizeSystem]})`} value={form.size} />
        <FieldRow label="Year" value={form.year} />
        <FieldRow label="Condition" value={`${form.conditionLabel} (${form.conditionRating}/10)`} />
        <FieldRow
          label="Price"
          value={`₱${(parseFloat(form.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
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
