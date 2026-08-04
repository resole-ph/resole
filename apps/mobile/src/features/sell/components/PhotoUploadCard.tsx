import { View, Text, Image, Dimensions } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { PHOTO_GUIDES } from '../constants/photoGuides';
import PhotoGuideImage from './PhotoGuideImage';
import type { SellPhoto, PhotoAngle } from '../types/sell.types';

const CARD_SIZE = (Dimensions.get('window').width - 48) / 2;

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  top: 'Top View',
  leftSide: 'Left Side View',
  rightSide: 'Right Side View',
  sole: 'Sole',
  insoleRight: 'Insole Right',
  insoleLeft: 'Insole Left',
};

// const ANGLE_ICONS: Record<PhotoAngle, keyof typeof Ionicons.glyphMap> = {
//   top: 'cloud-upload-outline',
//   leftSide: 'cloud-upload-outline',
//   rightSide: 'cloud-upload-outline',
//   sole: 'cloud-upload-outline',
//   insoleRight: 'cloud-upload-outline',
//   insoleLeft: 'cloud-upload-outline',
// };

interface PhotoUploadCardProps {
  angle: PhotoAngle;
  photo: SellPhoto | null;
  onPress: (angle: PhotoAngle) => void;
}

export default function PhotoUploadCard({ angle, photo, onPress }: PhotoUploadCardProps) {
  const guide = PHOTO_GUIDES[angle];

  return (
    <GuardedTouchableOpacity
      onPress={() => onPress(angle)}
      activeOpacity={0.75}
      style={{ width: CARD_SIZE, height: CARD_SIZE }}
    >
      {photo ? (
        <View style={{ width: CARD_SIZE, height: CARD_SIZE }}>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: CARD_SIZE, height: CARD_SIZE, borderRadius: 16 }}
            resizeMode="cover"
          />
          {/* Edit badge */}
          <View
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-primary items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="pencil" size={13} color="#fff" />
          </View>
          {/* Angle label overlay */}
          <View className="absolute top-2 left-2 bg-black/50 rounded-full px-2 py-0.5">
            <Text className="font-label-md text-label-md text-white">{ANGLE_LABELS[angle]}</Text>
          </View>
        </View>
      ) : (
        <View
          className="rounded-2xl overflow-hidden bg-white"
          style={{
            width: CARD_SIZE,
            height: CARD_SIZE,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: '#c2c6d8',
          }}
        >
          {/* Reference illustration of the exact shot this angle needs — given
              most of the card so it actually reads at this size, with the call
              to action pinned to its own solid strip instead of overlaid text
              fighting the image for attention. */}
          <View style={{ height: CARD_SIZE - 46 }}>
            <PhotoGuideImage guide={guide} zoom={1.45} />
            <View className="absolute top-1.5 left-1.5 bg-white rounded-full px-2 py-0.5" style={{ borderWidth: 1, borderColor: '#BFDBFE' }}>
              <Text className="font-label-md text-label-md text-blue-600" style={{ fontWeight: '700' }}>
                EXAMPLE
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-center justify-center px-2"
            style={{ height: 46, backgroundColor: '#0054d3' }}
          >
            <Ionicons name={'cloud-upload-outline'} size={16} color="#fff" />
            <View className="ml-1.5">
              <Text className="text-white text-center" style={{ fontSize: 12.5, fontWeight: '700', lineHeight: 15 }} numberOfLines={1}>
                {ANGLE_LABELS[angle]}
              </Text>
              <Text className="text-white/80 text-center" style={{ fontSize: 10.5, lineHeight: 13 }}>
                Tap to upload
              </Text>
            </View>
          </View>
        </View>
      )}
    </GuardedTouchableOpacity>
  );
}
