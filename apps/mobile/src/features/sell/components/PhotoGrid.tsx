import { View } from 'react-native';
import PhotoUploadCard from './PhotoUploadCard';
import type { SellPhoto, PhotoAngle } from '../types/sell.types';

const ANGLES: PhotoAngle[] = ['top', 'side', 'soles', 'insoles'];

interface PhotoGridProps {
  photos: Record<PhotoAngle, SellPhoto | null>;
  onPhotoPress: (angle: PhotoAngle) => void;
}

export default function PhotoGrid({ photos, onPhotoPress }: PhotoGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {ANGLES.map((angle) => (
        <PhotoUploadCard
          key={angle}
          angle={angle}
          photo={photos[angle]}
          onPress={onPhotoPress}
        />
      ))}
    </View>
  );
}
