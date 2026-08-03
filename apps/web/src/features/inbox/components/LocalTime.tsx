'use client';

import { useEffect, useState } from 'react';
import { formatListTime, formatMessageTime } from '../utils/format-time';

/**
 * Renders a timestamp in the viewer's own locale and timezone.
 *
 * Formatting is deferred to after mount on purpose: the server cannot know the
 * viewer's timezone, so anything it rendered here would be both wrong and a
 * hydration mismatch. The label is empty for the first paint and fills in as
 * soon as the page hydrates.
 */
export default function LocalTime({
  value,
  variant = 'list',
}: {
  value: string | null | undefined;
  variant?: 'list' | 'message';
}) {
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    setFormatted(variant === 'list' ? formatListTime(value) : formatMessageTime(value));
  }, [value, variant]);

  return <>{formatted}</>;
}
