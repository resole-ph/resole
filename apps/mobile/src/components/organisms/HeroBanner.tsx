import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeroBannerProps {
  onTryValuation?: () => void;
}

export default function HeroBanner({ onTryValuation }: HeroBannerProps) {
  return (
    <View className="mx-5 mb-4">
      <View
        className="bg-blue-600 rounded-3xl overflow-hidden p-5"
        style={{
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 10,
        }}
      >
        {/* Gradient feel — layered decorative circles */}
        <View
          className="absolute rounded-full bg-blue-500"
          style={{ width: 180, height: 180, top: -50, right: -30, opacity: 0.45 }}
        />
        <View
          className="absolute rounded-full bg-blue-400"
          style={{ width: 100, height: 100, top: -20, right: 60, opacity: 0.2 }}
        />
        <View
          className="absolute rounded-full bg-blue-800"
          style={{ width: 120, height: 120, bottom: -40, left: -30, opacity: 0.35 }}
        />

        <View className="flex-row items-center">
          {/* ── Left content ── */}
          <View className="flex-1 pr-2">
            {/* Headline */}
            <Text className="text-white text-xl font-bold leading-tight mb-2">
              Know what your{'\n'}kicks are worth.
            </Text>

            {/* Subtitle */}
            <Text className="text-blue-200 text-sm leading-snug mb-5">
              Snap 4 photos. Get an{'\n'}instant fair price.
            </Text>

            {/* CTA link */}
            <TouchableOpacity
              className="flex-row items-center self-start"
              activeOpacity={0.75}
              onPress={onTryValuation}
            >
              <Text className="text-white font-semibold text-sm mr-1">
                Try Valuation
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Graphic placeholder ── */}
          <View className="w-32 h-32 items-center justify-center rounded-2xl bg-white/10" />
        </View>
      </View>
    </View>
  );
}
