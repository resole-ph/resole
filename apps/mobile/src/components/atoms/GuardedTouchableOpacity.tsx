import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
type GuardedTouchableOpacityProps = Omit<TouchableOpacityProps, 'disabled' | 'onPress'> & {
  /** Prevent accidental repeated taps after a synchronous UI/navigation action. */
  cooldownMs?: number;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;
};

/**
 * A safe default for app actions. The ref makes the lock immediate (before a
 * render can occur), while state exposes that lock through `disabled`.
 */
export function GuardedTouchableOpacity({
  cooldownMs = 400,
  disabled = false,
  onPress,
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

    Promise.resolve()
      .then(() => onPress(event))
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) {
          releaseTimerRef.current = setTimeout(release, cooldownMs);
        }
      });
  }, [cooldownMs, disabled, onPress, release]);

  return <TouchableOpacity {...props} disabled={disabled || isLocked} onPress={handlePress} />;
}
