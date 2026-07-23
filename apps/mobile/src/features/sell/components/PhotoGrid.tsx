import { View } from 'react-native';
import PhotoUploadCard from './PhotoUploadCard';
import type { SellPhoto, PhotoAngle } from '../types/sell.types';

const PHOTO_ANGLES: PhotoAngle[] = ['leftSide', 'rightSide', 'top', 'sole', 'insole'];

interface PhotoGridProps {
  photos: Record<PhotoAngle, SellPhoto | null>;
  onPhotoPress: (angle: PhotoAngle) => void;
}

export default function PhotoGrid({ photos, onPhotoPress }: PhotoGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {PHOTO_ANGLES.map((angle) => (
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
