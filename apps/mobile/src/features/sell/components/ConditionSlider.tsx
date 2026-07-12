import { useRef, useState } from 'react';
import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 10;
const SEGMENT_COUNT = 24;

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

  function valueToX(v: number, w: number) {
    if (max === min) return 0;
    return ((v - min) / (max - min)) * w;
  }

  function xToValue(x: number, w: number) {
    if (w === 0) return min;
    const raw = (x / w) * (max - min) + min;
    return Math.round(Math.max(min, Math.min(max, raw)) * 10) / 10;
  }

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    trackWidth.current = w;
    thumbX.value = valueToX(value, w);
    setWidth(w);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const w = trackWidth.current;
        if (!w) return;
        const startX = valueToX(value, w);
        const newX = Math.max(0, Math.min(w, startX + gestureState.dx));
        thumbX.value = newX;
        const newValue = xToValue(newX, w);
        runOnJS(setDisplayValue)(newValue);
        runOnJS(onChange)(newValue);
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
  const aiX = valueToX(aiValue, width);

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-label-md text-label-md text-on-surface-variant">{min}</Text>
        <View className="rounded-full px-3 py-0.5" style={{ backgroundColor: `${toneColor}1a` }}>
          <Text className="font-label-md text-label-md" style={{ color: toneColor }}>
            {displayValue} / 10
          </Text>
        </View>
        <Text className="font-label-md text-label-md text-on-surface-variant">{max}</Text>
      </View>

      <View
        className="justify-center"
        style={{ height: THUMB_SIZE + 8 }}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Colored field: every position tinted by how far it is from the AI estimate */}
        <View
          className="flex-row rounded-full overflow-hidden"
          style={{ height: TRACK_HEIGHT }}
        >
          {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
            const segValue = min + ((i + 0.5) / SEGMENT_COUNT) * (max - min);
            const segColor = colorForDeviation(deviationFor(segValue, aiValue, min, max));
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: segColor,
                  marginRight: i < SEGMENT_COUNT - 1 ? 1 : 0,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </View>

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
