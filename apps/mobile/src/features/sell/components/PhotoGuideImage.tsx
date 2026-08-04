import { View, Image } from 'react-native';
import type { PhotoGuide } from '../constants/photoGuides';

interface PhotoGuideImageProps {
  guide: PhotoGuide;
  /** Context-level default zoom (grid tile vs. picker sheet use different
   * values). Overridden by `guide.zoom` when the illustration itself needs
   * a different crop, e.g. the insole shots' arrow sitting near the edge. */
  zoom?: number;
  backgroundColor?: string;
}

const CORNERS: Array<{ top?: number; bottom?: number; left?: number; right?: number; borderStyle: object }> = [
  { top: 0, left: 0, borderStyle: { borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 6 } },
  { top: 0, right: 0, borderStyle: { borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 6 } },
  { bottom: 0, left: 0, borderStyle: { borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 6 } },
  { bottom: 0, right: 0, borderStyle: { borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 6 } },
];

/**
 * The reference illustrations are tall (9:16) with the shoe sitting in a big
 * disc of background. `cover` alone crops toward the center, but a viewfinder
 * frame + extra zoom is what actually reads as "focus on the shoe, ignore the
 * background" at the small sizes these render at.
 */
export default function PhotoGuideImage({ guide, zoom = 1.35, backgroundColor = '#E6F4FE' }: PhotoGuideImageProps) {
  const effectiveZoom = guide.zoom ?? zoom;

  return (
    <View style={{ flex: 1, backgroundColor, overflow: 'hidden' }}>
      <Image
        source={guide.source}
        style={{
          width: '100%',
          height: '100%',
          transform: [{ scaleX: guide.mirrored ? -effectiveZoom : effectiveZoom }, { scaleY: effectiveZoom }],
        }}
        resizeMode="cover"
      />

      {/* Viewfinder frame around the subject, so the eye goes to the shoe
          instead of the illustration's background disc. */}
      <View pointerEvents="none" style={{ position: 'absolute', top: '14%', left: '14%', right: '14%', bottom: '14%' }}>
        {CORNERS.map((corner, i) => (
          <View
            key={i}
            style={[
              { position: 'absolute', width: 16, height: 16, borderColor: '#ffffff' },
              corner.top !== undefined ? { top: corner.top } : { bottom: corner.bottom },
              corner.left !== undefined ? { left: corner.left } : { right: corner.right },
              corner.borderStyle,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
