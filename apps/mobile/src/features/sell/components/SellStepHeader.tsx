import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SellStepHeaderProps {
  title: string;
  stepLabel?: string;
  onBack?: () => void;
}

export default function SellStepHeader({ title, stepLabel, onBack }: SellStepHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-surface border-b border-outline-variant px-4 pb-3"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 items-center justify-center rounded-full"
          style={{ opacity: onBack ? 1 : 0 }}
          disabled={!onBack}
        >
          <Ionicons name="chevron-back" size={22} color="#424655" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          {stepLabel ? (
            <Text className="font-label-md text-label-md text-on-surface-variant mb-0.5">
              {stepLabel}
            </Text>
          ) : null}
          <Text className="font-title-md text-title-md text-on-surface">{title}</Text>
        </View>

        {/* Spacer to keep the title centered now that the close button is gone */}
        <View className="w-9 h-9" />
      </View>
    </View>
  );
}
