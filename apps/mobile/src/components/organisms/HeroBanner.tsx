import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=900&auto=format&fit=crop';

interface HeroBannerProps {
  tag?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaVariant?: 'link' | 'pill';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  image?: string | null;
  onPress?: () => void;
}

export default function HeroBanner({
  tag,
  title = "Know what your\nkicks are worth.",
  subtitle = "Snap 4 photos. Get an\ninstant fair price.",
  ctaLabel = 'Try Valuation',
  ctaVariant = 'link',
  rightIcon,
  image = DEFAULT_IMAGE,
  onPress,
}: HeroBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const hasRetried = useRef(false);

  // Each tab switch remounts this screen, so a fresh Image mount can still hit
  // the same flaky network (e.g. right after login) that failed last time.
  useEffect(() => {
    setImageFailed(false);
    hasRetried.current = false;
  }, [image]);

  const handleImageError = () => {
    if (!hasRetried.current) {
      hasRetried.current = true;
      setRetryKey((k) => k + 1);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <View
      className="mx-5 mb-4"
      style={{
        borderRadius: 24,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 10,
      }}
    >
      {/* Shadow (elevation) and clipping (overflow: hidden) fight each other on
          Android when applied to the same view — the card can render collapsed
          on first paint until something forces a re-layout (e.g. switching
          tabs). Keeping overflow: hidden on this inner view, with elevation on
          the wrapper above, avoids the conflict. */}
      <View
        style={{
          position: 'relative',
          backgroundColor: '#2563EB',
          borderRadius: 24,
          overflow: 'hidden',
          padding: 20,
          minHeight: 180
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

        {!rightIcon && image && !imageFailed ? (
          <Image
            key={retryKey}
            source={{ uri: image, cache: 'force-cache' }}
            resizeMode="contain"
            onError={handleImageError}
            style={{
              position: 'absolute',
              right: -30,
              bottom: -30,
              width: 220,
              height: 220,
              transform: [{ rotate: '-10deg' }],
            }}
          />
        ) : null}

        <View style={{ maxWidth: rightIcon ? undefined : '68%' }}>
          <View className={rightIcon ? 'flex-row items-center' : undefined}>
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
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
