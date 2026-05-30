import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  showBack: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  title?: string;
}

export default function OnboardingHeader({ showBack, onBack, onSkip, title }: Props) {
  const { top } = useSafeAreaInsets();
  return (
    <View className="flex-row justify-between items-center w-full px-5 py-4" style={{ paddingTop: top + 16 }}>
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 items-center justify-center rounded-full bg-surface/50"
        style={{ opacity: showBack ? 1 : 0 }}
        disabled={!showBack}
      >
        <MaterialIcons name="arrow-back" size={24} color="#424655" />
      </TouchableOpacity>

      {title ? (
        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          {title}
        </Text>
      ) : (
        <View />
      )}

      {onSkip ? (
        <TouchableOpacity onPress={onSkip}>
          <Text className="font-label-md text-label-md text-primary uppercase tracking-widest">
            Skip
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
}
