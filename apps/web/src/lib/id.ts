/**
 * Converts a route or request identifier into a valid positive database id.
 * String values must contain the complete integer, so values such as `12abc`
 * are rejected rather than silently being treated as id 12.
 */
export function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
