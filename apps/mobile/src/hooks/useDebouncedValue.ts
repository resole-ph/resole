import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delayMs`, so a value bound to a search input can drive a
 * query without firing one request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
