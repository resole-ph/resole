import type { ImageSourcePropType } from 'react-native';
import type { PhotoAngle } from '../types/sell.types';

export interface PhotoGuide {
  /** Reference illustration showing the exact shot to take for this angle. */
  source: ImageSourcePropType;
  /** True when `source` is mirrored from its opposite angle (no dedicated asset exists). */
  mirrored?: boolean;
  /** One-line instruction shown alongside the reference image. */
  caption: string;
  /** Extra zoom on top of the cover-fit crop. Lower for illustrations with
   * detail (like the insole arrow) near the edge, which a tight crop cuts off. */
  zoom?: number;
}

const insoleRightSource = require('../../../../assets/photo-guides/guide-insole-right.webp');

/**
 * One reference illustration per required angle, matching the 6 shots the AI
 * valuation prompt actually asks for. `insoleLeft` has no illustration of its
 * own — it reuses the right insole shot mirrored, since both are the same
 * "tilt the shoe open" gesture on opposite feet.
 */
export const PHOTO_GUIDES: Record<PhotoAngle, PhotoGuide> = {
  top: {
    source: require('../../../../assets/photo-guides/guide-top.webp'),
    caption: 'Lay both shoes top-down, side by side, laces facing up.',
  },
  sole: {
    source: require('../../../../assets/photo-guides/guide-sole.webp'),
    caption: 'Flip both shoes over to show the outsoles and tread.',
  },
  leftSide: {
    source: require('../../../../assets/photo-guides/guide-left-side.webp'),
    caption: 'Show the outer face of the LEFT shoe, right shoe visible behind it.',
  },
  rightSide: {
    source: require('../../../../assets/photo-guides/guide-right-side.webp'),
    caption: 'Show the outer face of the RIGHT shoe, left shoe visible behind it.',
  },
  insoleRight: {
    source: insoleRightSource,
    caption: 'Tilt the RIGHT shoe open to reveal the insole and size tag.',
    // The arrow pointing at the insole sits near the frame's edge — a tight
    // zoom crops it out, so this one stays close to a plain cover fit.
    zoom: 1.05,
  },
  insoleLeft: {
    source: insoleRightSource,
    mirrored: true,
    caption: 'Tilt the LEFT shoe open to reveal the insole and size tag.',
    zoom: 1.05,
  },
};
