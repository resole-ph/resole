import * as Haptics from 'expo-haptics';

/**
 * Fire-and-forget haptic feedback.
 *
 * Every call is deliberately un-awaited and swallows its own errors: feedback is
 * decoration, so a device without a vibrator, a browser without the Vibration
 * API, or an iPhone in Low Power Mode must never break the action it accompanies.
 */

/** Named for what the app is saying, not for how strongly the phone buzzes. */
export type HapticFeel =
  /** A tap landed — the default for ordinary buttons. */
  | 'tap'
  /** A heavier press: submitting, confirming, committing to something. */
  | 'press'
  /** Moving through options — stars, tabs, segmented controls. */
  | 'select'
  /** The thing you asked for worked. */
  | 'success'
  /** Went through, but it's the destructive/negative branch. */
  | 'warning'
  /** It failed. */
  | 'error';

function run(feel: HapticFeel): void {
  const promise =
    feel === 'tap'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : feel === 'press'
        ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        : feel === 'select'
          ? Haptics.selectionAsync()
          : feel === 'success'
            ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            : feel === 'warning'
              ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
              : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  promise.catch(() => undefined);
}

export const haptic = {
  tap: () => run('tap'),
  press: () => run('press'),
  select: () => run('select'),
  success: () => run('success'),
  warning: () => run('warning'),
  error: () => run('error'),
  /** Dynamic form, for when the feel is chosen at runtime. */
  feel: (feel: HapticFeel) => run(feel),
};
