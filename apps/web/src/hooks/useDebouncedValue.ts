'use client';

import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delayMs`, so a value bound to an input can drive a query
 * without firing one request per keystroke. Typing "jordan" used to send twelve
 * requests from the market page; debounced it sends one.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
