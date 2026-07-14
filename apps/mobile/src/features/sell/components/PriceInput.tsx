import { View, Text, TextInput } from 'react-native';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Omit when there's no fresh AI valuation this session (e.g. editing without re-analyzing). */
  minPrice?: number;
  maxPrice?: number;
  error?: string;
}

export default function PriceInput({ value, onChange, minPrice, maxPrice, error }: PriceInputProps) {
  const hasRange = minPrice !== undefined && maxPrice !== undefined;
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const isOutOfRange =
    hasRange && !isNaN(numericValue) && value !== '' && (numericValue < minPrice! || numericValue > maxPrice!);

  return (
    <View className="gap-1">
      <View
        className="flex-row items-center bg-surface-container-lowest border rounded-xl overflow-hidden"
        style={{ borderColor: error ? '#ba1a1a' : isOutOfRange ? '#ba1a1a' : '#c2c6d8' }}
      >
        <View className="px-3 py-3 border-r border-outline-variant">
          <Text className="font-body-md text-body-md text-on-surface-variant">₱</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))}
          placeholder={hasRange ? String(minPrice) : '0'}
          placeholderTextColor="#727687"
          keyboardType="numeric"
          className="flex-1 py-3 px-3 font-body-md text-body-md text-on-surface"
        />
      </View>

      {hasRange && (
        <View className="flex-row items-center justify-between">
          <Text className="font-label-md text-label-md text-on-surface-variant">
            AI range: ₱{minPrice!.toLocaleString()} – ₱{maxPrice!.toLocaleString()}
          </Text>
          {!error && isOutOfRange && (
            <Text className="font-label-md text-label-md text-error">Outside ±15%</Text>
          )}
        </View>
      )}
      {error && <Text className="font-label-md text-label-md text-error">{error}</Text>}
    </View>
  );
}
