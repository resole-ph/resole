import { useRef, useState } from 'react';
import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 10;

const GOOD = { r: 0x05, g: 0x96, b: 0x69 };  // #059669
const WARN = { r: 0xd9, g: 0x77, b: 0x06 };  // #d97706
const BAD  = { r: 0xdc, g: 0x26, b: 0x26 };  // #dc2626

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function toHex(c: { r: number; g: number; b: number }) {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** 0 = right on the AI estimate, 1 = as far as it gets on the scale. */
function deviationFor(value: number, aiValue: number, min: number, max: number) {
  const scale = Math.max(max - min, 1);
  return Math.min(1, Math.abs(value - aiValue) / scale);
}

/** Green near the AI estimate, fading through amber to red the further off it gets. */
function colorForDeviation(deviation: number) {
  const t = Math.min(1, deviation / 0.5);
  if (t <= 0.5) {
    const step = t / 0.5;
    return toHex({ r: lerp(GOOD.r, WARN.r, step), g: lerp(GOOD.g, WARN.g, step), b: lerp(GOOD.b, WARN.b, step) });
  }
  const step = (t - 0.5) / 0.5;
  return toHex({ r: lerp(WARN.r, BAD.r, step), g: lerp(WARN.g, BAD.g, step), b: lerp(WARN.b, BAD.b, step) });
}

function toneFor(deviation: number): 'good' | 'warn' | 'bad' {
  if (deviation <= 0.15) return 'good';
  if (deviation <= 0.35) return 'warn';
  return 'bad';
}

/** Shared with EditListingContainer so the big rating number/label can carry
 * the same tone color as this slider, instead of it living only in the bar. */
export function getConditionTone(value: number, aiValue: number, min: number, max: number) {
  const deviation = deviationFor(value, aiValue, min, max);
  return { color: colorForDeviation(deviation), tone: toneFor(deviation) };
}

function messageFor(tone: 'good' | 'warn' | 'bad', aiValue: number) {
  switch (tone) {
    case 'good':
      return `Matches our AI's estimate of ${aiValue}/10 — looks good.`;
    case 'warn':
      return `A bit different from our AI's estimate of ${aiValue}/10. Double-check before continuing.`;
    case 'bad':
      return `Way off from our AI's estimate of ${aiValue}/10. Buyers may flag this listing as inaccurate.`;
  }
}

function valueToX(v: number, min: number, max: number, w: number) {
  if (max === min) return 0;
  return ((v - min) / (max - min)) * w;
}

function xToValue(x: number, min: number, max: number, w: number) {
  if (w === 0) return min;
  const raw = (x / w) * (max - min) + min;
  return Math.round(Math.max(min, Math.min(max, raw)) * 10) / 10;
}

interface ConditionSliderProps {
  value: number;
  min: number;
  max: number;
  /** The AI-suggested condition rating this value is measured against. */
  aiValue: number;
  onChange: (value: number) => void;
}

export default function ConditionSlider({ value, min, max, aiValue, onChange }: ConditionSliderProps) {
  const trackWidth = useRef(0);
  const thumbX = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(value);
  const [width, setWidth] = useState(0);

  // PanResponder is created once and its callbacks close over whatever these
  // refs point to *at call time* — keeping them in refs (updated every render)
  // instead of reading `value`/`min`/`max`/`onChange` directly avoids the
  // callbacks ever operating on stale, first-render values.
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const onChangeRef = useRef(onChange);
  const committedValueRef = useRef(value);
  const gestureStartXRef = useRef(0);
  minRef.current = min;
  maxRef.current = max;
  onChangeRef.current = onChange;
  committedValueRef.current = value;

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    trackWidth.current = w;
    thumbX.value = valueToX(value, min, max, w);
    setWidth(w);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const w = trackWidth.current;
        gestureStartXRef.current = valueToX(committedValueRef.current, minRef.current, maxRef.current, w);
      },
      onPanResponderMove: (_, gestureState) => {
        const w = trackWidth.current;
        if (!w) return;
        const newX = Math.max(0, Math.min(w, gestureStartXRef.current + gestureState.dx));
        thumbX.value = newX;
        const newValue = xToValue(newX, minRef.current, maxRef.current, w);
        if (newValue !== committedValueRef.current) {
          committedValueRef.current = newValue;
          setDisplayValue(newValue);
          onChangeRef.current(newValue);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const deviation = deviationFor(displayValue, aiValue, min, max);
  const tone = toneFor(deviation);
  const toneColor = colorForDeviation(deviation);
  const aiX = valueToX(aiValue, min, max, width);

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-label-md text-label-md text-on-surface-variant">{min}</Text>
        <Text className="font-label-md text-label-md text-on-surface-variant">{max}</Text>
      </View>

      <View
        className="justify-center"
        style={{ height: THUMB_SIZE + 8 }}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Plain track */}
        <View
          className="rounded-full"
          style={{ height: TRACK_HEIGHT, backgroundColor: '#e0e2ec' }}
        />

        {/* AI estimate marker */}
        {width > 0 && (
          <View
            pointerEvents="none"
            className="absolute rounded-full bg-on-surface"
            style={{ left: aiX - 1, width: 2, height: THUMB_SIZE, opacity: 0.35 }}
          />
        )}

        {/* Thumb */}
        <Animated.View
          className="absolute rounded-full bg-surface"
          style={[
            thumbStyle,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderWidth: 3,
              borderColor: toneColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4,
            },
          ]}
        />
      </View>

      <Text className="font-label-md text-label-md mt-1" style={{ color: toneColor }}>
        {messageFor(tone, aiValue)}
      </Text>
    </View>
  );
}
