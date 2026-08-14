import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { haptic, type HapticFeel } from '@/lib/haptics';

type GuardedTouchableOpacityProps = Omit<TouchableOpacityProps, 'disabled' | 'onPress'> & {
  /** Prevent accidental repeated taps after a synchronous UI/navigation action. */
  cooldownMs?: number;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;
  /**
   * Haptic feedback on a press that actually runs. Off by default so the app
   * stays quiet except where feedback is earned; `true` is shorthand for 'tap'.
   */
  haptic?: HapticFeel | boolean;
};

/**
 * A safe default for app actions. The ref makes the lock immediate (before a
 * render can occur), while state exposes that lock through `disabled`.
 */
export function GuardedTouchableOpacity({
  cooldownMs = 400,
  disabled = false,
  onPress,
  haptic: hapticFeel = false,
  ...props
}: GuardedTouchableOpacityProps) {
  const lockedRef = useRef(false);
  const mountedRef = useRef(true);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const release = useCallback(() => {
    lockedRef.current = false;
    if (mountedRef.current) setIsLocked(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled || lockedRef.current || !onPress) return;

    // Guarded callbacks run in a promise chain so they can support async
    // handlers. Persist first, before any nested handler calls
    // `stopPropagation`, to prevent React Native from releasing the event.
    event.persist();
    lockedRef.current = true;
    setIsLocked(true);

    // Fires only past the guard, so a tap swallowed by the cooldown stays silent
    // — buzzing on an ignored tap would report success the press never had.
    if (hapticFeel) {
      haptic.feel(hapticFeel === true ? 'tap' : hapticFeel);
    }

    Promise.resolve()
      .then(() => onPress(event))
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) {
          releaseTimerRef.current = setTimeout(release, cooldownMs);
        }
      });
  }, [cooldownMs, disabled, hapticFeel, onPress, release]);

  return <TouchableOpacity {...props} disabled={disabled || isLocked} onPress={handlePress} />;
}
