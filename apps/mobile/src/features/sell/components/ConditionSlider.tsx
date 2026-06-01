import { useRef, useState } from 'react';
import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;

interface ConditionSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function ConditionSlider({ value, min, max, onChange }: ConditionSliderProps) {
  const trackWidth = useRef(0);
  const thumbX = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(value);

  function valueToX(v: number, width: number) {
    if (max === min) return 0;
    return ((v - min) / (max - min)) * width;
  }

  function xToValue(x: number, width: number) {
    if (width === 0) return min;
    const raw = (x / width) * (max - min) + min;
    return Math.round(Math.max(min, Math.min(max, raw)));
  }

  function onLayout(e: LayoutChangeEvent) {
    const width = e.nativeEvent.layout.width;
    trackWidth.current = width;
    thumbX.value = valueToX(value, width);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const width = trackWidth.current;
        if (!width) return;
        const startX = valueToX(value, width);
        const newX = Math.max(0, Math.min(width, startX + gestureState.dx));
        thumbX.value = newX;
        const newValue = xToValue(newX, width);
        runOnJS(setDisplayValue)(newValue);
        runOnJS(onChange)(newValue);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="font-label-md text-label-md text-on-surface-variant">{min}</Text>
        <View className="bg-secondary-container rounded-full px-3 py-0.5">
          <Text className="font-label-md text-label-md text-primary">
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
        {/* Track */}
        <View
          className="rounded-full bg-outline-variant overflow-hidden"
          style={{ height: TRACK_HEIGHT }}
        >
          <Animated.View
            className="h-full rounded-full bg-primary"
            style={fillStyle}
          />
        </View>

        {/* Thumb */}
        <Animated.View
          className="absolute rounded-full bg-primary"
          style={[
            thumbStyle,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              top: (THUMB_SIZE + 8 - THUMB_SIZE) / 2,
              shadowColor: '#0054d3',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 4,
              elevation: 4,
            },
          ]}
        />
      </View>
    </View>
  );
}
