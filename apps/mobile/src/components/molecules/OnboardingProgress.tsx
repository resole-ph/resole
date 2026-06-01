import { View } from 'react-native';

interface Props {
  total: number;
  current: number;
}

export default function OnboardingProgress({ total, current }: Props) {
  return (
    <View className="flex-row justify-center gap-2 w-full">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current;
        return (
          <View
            key={i}
            className={
              isActive
                ? 'h-1.5 w-12 rounded-full bg-primary'
                : 'h-1.5 w-12 rounded-full bg-surface-container-highest'
            }
          />
        );
      })}
    </View>
  );
}
