import { View, Text, TextInput } from 'react-native';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Omit when there's no fresh AI valuation this session (e.g. editing without re-analyzing). */
  minPrice?: number;
  maxPrice?: number;
  error?: string;
}

/** Digits plus a single decimal point, capped at 2 decimal places. */
function sanitizePriceInput(raw: string): string {
  let v = raw.replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot === -1) return v;
  const intPart = v.slice(0, firstDot);
  const decPart = v.slice(firstDot + 1).replace(/\./g, '');
  return `${intPart}.${decPart.slice(0, 2)}`;
}

function formatPeso(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PriceInput({ value, onChange, minPrice, maxPrice, error }: PriceInputProps) {
  const hasRange = minPrice !== undefined && maxPrice !== undefined;
  const numericValue = parseFloat(value);
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
          onChangeText={(v) => onChange(sanitizePriceInput(v))}
          placeholder={hasRange ? formatPeso(minPrice!) : '0.00'}
          placeholderTextColor="#727687"
          keyboardType="decimal-pad"
          className="flex-1 py-3 px-3 font-body-md text-body-md text-on-surface"
        />
      </View>

      {hasRange && (
        <View className="flex-row items-center justify-between">
          <Text className="font-label-md text-label-md text-on-surface-variant">
            AI range: ₱{formatPeso(minPrice!)} – ₱{formatPeso(maxPrice!)}
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
