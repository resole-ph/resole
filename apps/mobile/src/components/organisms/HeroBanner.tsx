import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeroBannerProps {
  tag?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaVariant?: 'link' | 'pill';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function HeroBanner({
  tag,
  title = "Know what your\nkicks are worth.",
  subtitle = "Snap 4 photos. Get an\ninstant fair price.",
  ctaLabel = 'Try Valuation',
  ctaVariant = 'link',
  rightIcon,
  onPress,
}: HeroBannerProps) {
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
        {/* Decorative circles */}
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
          <View className="flex-1 pr-2">
            {tag ? (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>{tag}</Text>
              </View>
            ) : null}

            <Text className="text-white text-xl font-bold leading-tight mb-2">{title}</Text>
            <Text className="text-blue-200 text-sm leading-snug mb-5">{subtitle}</Text>

            {ctaVariant === 'pill' ? (
              <TouchableOpacity
                style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8 }}
                activeOpacity={0.75}
                onPress={onPress}
              >
                <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{ctaLabel} →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-row items-center self-start"
                activeOpacity={0.75}
                onPress={onPress}
              >
                <Text className="text-white font-semibold text-sm mr-1">{ctaLabel}</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {rightIcon ? (
            <View
              style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginLeft: 14 }}
            >
              <Ionicons name={rightIcon} size={34} color="rgba(255,255,255,0.95)" />
            </View>
          ) : (
            <View className="w-32 h-32 items-center justify-center rounded-2xl bg-white/10" />
          )}
        </View>
      </View>
    </View>
  );
}
