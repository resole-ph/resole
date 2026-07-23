import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SellPhoto, PhotoAngle } from '../types/sell.types';

const CARD_SIZE = (Dimensions.get('window').width - 48) / 2;

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  leftSide: 'Left Side View',
  rightSide: 'Right Side View',
  top: 'Top View',
  sole: 'Sole',
  insole: 'Insole',
};

const ANGLE_ICONS: Record<PhotoAngle, keyof typeof Ionicons.glyphMap> = {
  leftSide: 'arrow-back-circle-outline',
  rightSide: 'arrow-forward-circle-outline',
  top: 'arrow-up-circle-outline',
  sole: 'footsteps-outline',
  insole: 'layers-outline',
};

interface PhotoUploadCardProps {
  angle: PhotoAngle;
  photo: SellPhoto | null;
  onPress: (angle: PhotoAngle) => void;
}

export default function PhotoUploadCard({ angle, photo, onPress }: PhotoUploadCardProps) {
  return (
    <TouchableOpacity
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
          className="rounded-2xl items-center justify-center bg-surface-container-low"
          style={{
            width: CARD_SIZE,
            height: CARD_SIZE,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: '#c2c6d8',
          }}
        >
          <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center mb-2">
            <Ionicons name={ANGLE_ICONS[angle]} size={20} color="#0054d3" />
          </View>
          <Text className="font-body-md text-body-md text-on-surface text-center">
            {ANGLE_LABELS[angle]}
          </Text>
          <Text className="font-label-md text-label-md text-on-surface-variant mt-0.5">
            Tap to upload
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
