import { describe, expect, it } from 'vitest';
import { InvalidShoePhotoError, SHOE_ANALYSIS_SCHEMA, interpretAnalysisResponse } from '@/features/shoe/utils/analysis-response';

/**
 * A photo set that passes both gates. Individual tests override only the fields
 * they care about, so an accidental change to a gate shows up as a focused failure.
 */
const CLEAN_RESPONSE = {
  isValidPhotoSet: true,
  rejectionReason: '',
  isSameShoeThroughout: true,
  mismatchReason: '',
  angleWarning: '',
  brand: 'Adidas',
  model: 'Samba OG',
  colorway: 'Core Black / Cloud White',
  size: '10',
  category: 'lifestyle',
  year: 2023,
  conditionScore: 8,
  description: 'Lightly worn pair with clean uppers.',
  defects: ['Both: minor toe creasing'],
  estimatedPrice: 6500,
};

function respond(overrides: Partial<typeof CLEAN_RESPONSE> = {}) {
  return JSON.stringify({ ...CLEAN_RESPONSE, ...overrides });
}

describe('interpretAnalysisResponse', () => {
  it('returns the analysis for a clean photo set, with no warnings', () => {
    const result = interpretAnalysisResponse(respond());

    expect(result.brand).toBe('Adidas');
    expect(result.model).toBe('Samba OG');
    expect(result.conditionScore).toBe(8);
    expect(result.defects).toEqual(['Both: minor toe creasing']);
    expect(result.lightingWarning).toBeUndefined();
    expect(result.angleWarning).toBeUndefined();
  });

  it('surfaces a lighting tip as a warning rather than an error', () => {
    const tip = "The 'Sole' photo is a bit dark — retaking it in brighter light can improve accuracy.";
    const result = interpretAnalysisResponse(respond({ rejectionReason: tip }));

    expect(result.lightingWarning).toBe(tip);
    expect(result.brand).toBe('Adidas');
  });

  it('passes an angle warning through untouched', () => {
    const warning = "The 'Sole' photo looks like a side view — double-check that slot.";
    const result = interpretAnalysisResponse(respond({ angleWarning: warning }));

    expect(result.angleWarning).toBe(warning);
    expect(result.lightingWarning).toBeUndefined();
  });

  it('never leaks the gate fields into the returned analysis', () => {
    const result = interpretAnalysisResponse(respond({ rejectionReason: 'a lighting tip' }));

    expect(result).not.toHaveProperty('isValidPhotoSet');
    expect(result).not.toHaveProperty('rejectionReason');
    expect(result).not.toHaveProperty('isSameShoeThroughout');
    expect(result).not.toHaveProperty('mismatchReason');
  });

  describe('photo-validity gate', () => {
    it('rejects an invalid set with the model’s own reason', () => {
      const reason = "The 'Insole Right' photo does not show a shoe.";

      expect(() => interpretAnalysisResponse(respond({ isValidPhotoSet: false, rejectionReason: reason }))).toThrow(
        InvalidShoePhotoError
      );
      expect(() => interpretAnalysisResponse(respond({ isValidPhotoSet: false, rejectionReason: reason }))).toThrow(reason);
    });

    it('falls back to a generic message when the model gives no reason', () => {
      expect(() => interpretAnalysisResponse(respond({ isValidPhotoSet: false, rejectionReason: '' }))).toThrow(
        "We couldn't spot a shoe in one of your photos. Please check all 6 photos and retake any that don't clearly show your pair."
      );
    });
  });

  describe('subject-consistency gate', () => {
    it('rejects a set containing a different shoe, with the model’s own reason', () => {
      const reason = "The 'Sole' photo looks like a different shoe from the other photos.";
      const body = respond({ isSameShoeThroughout: false, mismatchReason: reason });

      expect(() => interpretAnalysisResponse(body)).toThrow(InvalidShoePhotoError);
      expect(() => interpretAnalysisResponse(body)).toThrow(reason);
    });

    it('falls back to a generic message when the model gives no reason', () => {
      expect(() => interpretAnalysisResponse(respond({ isSameShoeThroughout: false, mismatchReason: '' }))).toThrow(
        'One of your photos looks like a different shoe. Please make sure all 6 photos are of the same pair, then try again.'
      );
    });

    it('does not reject a valid set just because a lighting tip is present', () => {
      expect(() => interpretAnalysisResponse(respond({ rejectionReason: 'The photos are a little dim.' }))).not.toThrow();
    });
  });

  it('reports the validity failure first when both gates fail', () => {
    // A photo that isn't a shoe at all also trips consistency; "that isn't a shoe" is
    // the more actionable message, so it must win.
    const body = respond({
      isValidPhotoSet: false,
      rejectionReason: 'not a shoe',
      isSameShoeThroughout: false,
      mismatchReason: 'different shoe',
    });

    expect(() => interpretAnalysisResponse(body)).toThrow('not a shoe');
  });
});

describe('SHOE_ANALYSIS_SCHEMA', () => {
  it('requires every gate field, so the model can never omit one', () => {
    for (const field of ['isValidPhotoSet', 'rejectionReason', 'isSameShoeThroughout', 'mismatchReason', 'angleWarning']) {
      expect(SHOE_ANALYSIS_SCHEMA.properties).toHaveProperty(field);
      expect(SHOE_ANALYSIS_SCHEMA.required).toContain(field);
    }
  });

  it('requires every property it declares', () => {
    expect([...SHOE_ANALYSIS_SCHEMA.required].sort()).toEqual(Object.keys(SHOE_ANALYSIS_SCHEMA.properties).sort());
  });
});
