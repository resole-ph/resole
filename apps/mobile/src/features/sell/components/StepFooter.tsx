import { View, Text, ActivityIndicator } from 'react-native';

import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
interface StepFooterProps {
  onCancel: () => void;
  cancelLabel?: string;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  helperText?: string;
  helperTextError?: boolean;
}

export default function StepFooter({
  onCancel,
  cancelLabel = 'Cancel',
  onPrimary,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  helperText,
  helperTextError,
}: StepFooterProps) {
  return (
    <View className="px-4 pb-8 pt-2">
      {helperText ? (
        <Text
          className={`font-label-md text-label-md text-center mb-2 ${helperTextError ? 'text-error' : 'text-on-surface-variant'}`}
        >
          {helperText}
        </Text>
      ) : null}
      <View className="flex-row gap-3">
        <GuardedTouchableOpacity
          onPress={onCancel}
          disabled={primaryLoading}
          className="flex-1 rounded-full py-4 items-center border border-outline-variant"
        >
          <Text className="font-body-md text-body-md text-on-surface-variant">{cancelLabel}</Text>
        </GuardedTouchableOpacity>

        <GuardedTouchableOpacity
          onPress={onPrimary}
          disabled={primaryDisabled || primaryLoading}
          className="flex-1 rounded-full py-4 items-center"
          style={{
            backgroundColor: primaryDisabled ? '#c2c6d8' : '#0054d3',
            shadowColor: primaryDisabled ? 'transparent' : '#0054d3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: primaryDisabled ? 0 : 6,
          }}
        >
          {primaryLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text
              className="font-body-md text-body-md"
              style={{ color: primaryDisabled ? '#727687' : '#ffffff' }}
            >
              {primaryLabel}
            </Text>
          )}
        </GuardedTouchableOpacity>
      </View>
    </View>
  );
}
