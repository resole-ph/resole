import { View, Text, Image } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const resoleLogo = require('../../../assets/ReSoleLogo.png');

interface Props {
  showBack: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  title?: string;
  logo?: boolean;
}

export default function OnboardingHeader({ showBack, onBack, onSkip, title, logo }: Props) {
  const { top } = useSafeAreaInsets();
  return (
    <View className="flex-row justify-between items-center w-full px-5 py-4" style={{ paddingTop: top + 16 }}>
      <GuardedTouchableOpacity
        onPress={onBack}
        className="w-10 h-10 items-center justify-center rounded-full bg-surface/50"
        style={{ opacity: showBack ? 1 : 0 }}
        disabled={!showBack}
      >
        <MaterialIcons name="arrow-back" size={24} color="#424655" />
      </GuardedTouchableOpacity>

      {logo ? (
        <Image source={resoleLogo} style={{ height: 44, width: 188, marginTop: 8 }} resizeMode="contain" />
      ) : title ? (
        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          {title}
        </Text>
      ) : (
        <View />
      )}

      {onSkip ? (
        <GuardedTouchableOpacity onPress={onSkip}>
          <Text className="font-label-md text-label-md text-primary uppercase tracking-widest">
            Skip
          </Text>
        </GuardedTouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}
