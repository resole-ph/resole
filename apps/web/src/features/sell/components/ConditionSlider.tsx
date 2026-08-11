'use client';

import {
  deviationFor,
  colorForDeviation,
  toneFor,
  getDeviationMessage,
} from '../utils/condition-tone';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 10;

interface ConditionSliderProps {
  value: number;
  min: number;
  max: number;
  /** The AI-suggested condition rating this value is measured against. */
  aiValue: number;
  /** The condition word (Good/Poor/etc.) for the current value, used in the message below. */
  conditionLabel: string;
  onChange: (value: number) => void;
}

/**
 * Web counterpart of the mobile ConditionSlider. Mobile hand-rolls the track
 * with a PanResponder because React Native has no range input; here a real
 * `<input type="range">` does the same job and keeps keyboard control and
 * screen-reader semantics for free. The parts that carry meaning are the same:
 * a marker pinned at the AI's estimate, a thumb tinted by how far the seller
 * has moved from it, and a sentence naming the gap.
 */
export default function ConditionSlider({
  value,
  min,
  max,
  aiValue,
  conditionLabel,
  onChange,
}: ConditionSliderProps) {
  const deviation = deviationFor(value, aiValue, min, max);
  const tone = toneFor(deviation);
  const toneColor = colorForDeviation(deviation);

  // The thumb is positioned by its centre, which stays half a thumb in from
  // each end of the track, so the marker has to be placed against that inset
  // span — not the full width — or it drifts off the thumb at the extremes.
  const aiOffset = max === min ? 0 : (aiValue - min) / (max - min);
  const aiLeft = `calc(${THUMB_SIZE / 2}px + ${aiOffset} * (100% - ${THUMB_SIZE}px))`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-on-surface-variant">{min}</span>
        <span className="text-[12px] font-semibold text-on-surface-variant">{max}</span>
      </div>

      <div className="relative flex items-center" style={{ height: THUMB_SIZE + 8 }}>
        {/* AI estimate marker. Behind the thumb and click-through, so it never
            intercepts a drag aimed at the slider. */}
        <div
          aria-hidden
          className="absolute rounded-full bg-on-surface pointer-events-none"
          style={{ left: aiLeft, width: 2, height: THUMB_SIZE, opacity: 0.35, marginLeft: -1 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Condition rating"
          aria-valuetext={`${value} out of ${max}, ${conditionLabel}`}
          className="condition-slider"
          style={
            {
              '--tone-color': toneColor,
              '--track-height': `${TRACK_HEIGHT}px`,
              '--thumb-size': `${THUMB_SIZE}px`,
            } as React.CSSProperties
          }
        />

        {/* Scoped to this component. The thumb colour is driven by a CSS custom
            property because `accent-color` alone tints the filled track too,
            which would read as progress rather than as agreement with the AI. */}
        <style>{`
          .condition-slider {
            position: relative;
            width: 100%;
            height: var(--thumb-size);
            margin: 0;
            background: transparent;
            -webkit-appearance: none;
            appearance: none;
            cursor: pointer;
          }
          .condition-slider::-webkit-slider-runnable-track {
            height: var(--track-height);
            border-radius: 9999px;
            background: #e0e2ec;
          }
          .condition-slider::-moz-range-track {
            height: var(--track-height);
            border-radius: 9999px;
            background: #e0e2ec;
          }
          .condition-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: var(--thumb-size);
            height: var(--thumb-size);
            border-radius: 9999px;
            background: #ffffff;
            border: 3px solid var(--tone-color);
            box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.2);
            /* Centres the thumb on the track: half the height difference. */
            margin-top: calc((var(--track-height) - var(--thumb-size)) / 2);
          }
          .condition-slider::-moz-range-thumb {
            width: var(--thumb-size);
            height: var(--thumb-size);
            border-radius: 9999px;
            background: #ffffff;
            border: 3px solid var(--tone-color);
            box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.2);
          }
          .condition-slider:focus-visible::-webkit-slider-thumb {
            outline: 2px solid var(--tone-color);
            outline-offset: 2px;
          }
          .condition-slider:focus-visible::-moz-range-thumb {
            outline: 2px solid var(--tone-color);
            outline-offset: 2px;
          }
        `}</style>
      </div>

      <p className="text-[12px] font-semibold mt-1" style={{ color: toneColor }} aria-live="polite">
        {getDeviationMessage(tone, aiValue, conditionLabel)}
      </p>
    </div>
  );
}
