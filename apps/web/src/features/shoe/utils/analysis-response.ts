import type { ShoeAnalysis } from '@/features/shoe/types/types';

/** Thrown when Gemini rejects the uploaded photo set. Surfaces as a 400 with the message intact. */
export class InvalidShoePhotoError extends Error {}

/**
 * The six labels below are the exact strings the Photo step renders, so a rejection or warning
 * message that names one of them points at a tile the seller can actually find. Keep in sync with
 * `ANGLE_LABELS` in PhotoDropzone.tsx (web) and PhotoUploadCard.tsx / PhotoUploadContainer.tsx (mobile).
 */
export const SHOE_ANALYSIS_PROMPT = [
  'You are an expert sneaker authenticator, appraiser, and visual inspector.',
  '',
  'INPUT PHOTOS:',
  'These 6 photos are SUPPOSED to show ONE pair of shoes (left + right) together in every frame, provided in this exact order. Do not assume this is true — verify it under SUBJECT CONSISTENCY below.',
  '1. "Top View" — top view of both shoes',
  '2. "Left Side View" — outer face of the LEFT shoe (right shoe also visible)',
  '3. "Right Side View" — outer face of the RIGHT shoe (left shoe also visible)',
  '4. "Sole" — both shoes flipped over, outsoles visible',
  '5. "Insole Right" — right shoe tilted open, insole and size label visible',
  '6. "Insole Left" — left shoe tilted open, insole and size label visible',
  '',
  'WRITING MESSAGES TO THE SELLER:',
  'Every message you write (`rejectionReason`, `mismatchReason`, `angleWarning`) is shown word-for-word to the person selling the shoes. All of them must follow these rules:',
  '• Write ONE short sentence in plain, everyday English. Address the seller directly as "you" and "your".',
  '• Name the affected photo by its exact label from the list above, in quotes (e.g. the "Sole" photo) — NEVER by number, and never invent a label that is not on that list.',
  '• Always end with what to do next, not just what is wrong (e.g. "…try retaking it in brighter light.").',
  '• Stay warm and matter-of-fact. Never blame the seller, never sound alarming or accusatory, and never imply the shoes are fake or the upload was deliberate.',
  '• Never mention JSON, fields, schemas, labels like `isValidPhotoSet`, confidence scores, internal rules, or that you are an AI model.',
  '',
  'LIGHTING & QUALITY ASSESSMENT:',
  '• Photos are ideally clear and well-lit so details, stitching, logos, sole wear, and size tags are easy to inspect.',
  '• Be LENIENT about lighting — never reject the whole photo set just because lighting is imperfect. Do your best to identify brand, model, condition, and defects even from photos with dim, shadowed, or glare-y lighting, as long as the shoe itself and its key details are still discernible.',
  '',
  'VALIDATION RULES:',
  '1. Set `isValidPhotoSet` to FALSE ONLY if:',
  '   a) Any photo clearly does NOT show footwear (e.g. random scene, person, non-shoe object, blank/corrupted image).',
  '   b) Any photo is so pitch-black, blown-out, or blurred that literally NOTHING about the shoe is visible or usable — not merely dim or somewhat shadowed.',
  '2. If `isValidPhotoSet` is FALSE:',
  '   • Set `rejectionReason` following WRITING MESSAGES TO THE SELLER above — e.g. "We couldn\'t spot a shoe in your \'Insole Right\' photo — please retake that one and upload it again."',
  '   • Fill all other schema fields with neutral placeholders (empty string / 0 / empty array).',
  '3. If `isValidPhotoSet` is TRUE:',
  '   • If one or more photos have noticeably poor lighting (dim, shadowed, or glare) that made analysis harder but still possible, set `rejectionReason` to a lighting tip — e.g. "Your \'Sole\' photo came out a little dark — retaking it in brighter light can make the valuation more accurate." This is just a tip, NOT a rejection — the set is still valid.',
  '   • Otherwise (lighting was fine), set `rejectionReason` to "".',
  '',
  'ANGLE VERIFICATION:',
  '• For each of the 6 labeled photos, check whether it plausibly shows the angle named by its label above.',
  '• If one or more photos clearly show the wrong angle for their slot (e.g. the "Sole" slot actually contains a side-view shot), set `angleWarning` to a heads-up following WRITING MESSAGES TO THE SELLER above — e.g. "Your \'Sole\' photo looks like a side view — double-check that the outsole shot went into that slot." This is just a heads-up, NOT a rejection.',
  '• Minor tilt/framing differences do NOT count as a mismatch — only flag photos that clearly show a different angle than labeled.',
  '• If all photos reasonably match their labels, set `angleWarning` to "".',
  '• Angle mismatches never affect `isValidPhotoSet` — that field is governed solely by the VALIDATION RULES above.',
  '',
  'SUBJECT CONSISTENCY:',
  '• All 6 photos must show the SAME pair of shoes. Cross-check them against each other on: overall silhouette and model shape, branding and logo placement, upper material and texture, colorway and color-blocking layout, and outsole tread pattern.',
  '• Be CONSERVATIVE — flag a mismatch only when you are confident a photo shows a genuinely different shoe. The following are NOT mismatches and must be ignored:',
  '   – Lighting, white balance, exposure, or shadow differences that change how a color reads.',
  '   – Different zoom, crop, distance, or camera angle.',
  '   – Left vs. right shoe of the same pair — they are mirror images, and uneven wear or creasing between them is normal.',
  '   – Insole/interior views not resembling exterior views — insoles legitimately expose different materials, colors, and branding than the upper.',
  '• Set `isSameShoeThroughout` to FALSE only if one or more photos clearly show a DIFFERENT shoe model, or the same model in a clearly different colorway — a difference no lighting condition could explain.',
  '• When a single photo disagrees with the other five, that one photo is the odd one out — name it, not the other five.',
  '• If `isSameShoeThroughout` is FALSE, set `mismatchReason` following WRITING MESSAGES TO THE SELLER above, naming the odd photo(s) and saying briefly what looks different — e.g. "Your \'Sole\' photo looks like a different shoe from the other five — please swap in a photo of the same pair and try again."',
  '• If `isSameShoeThroughout` is TRUE, set `mismatchReason` to "".',
  '• `isSameShoeThroughout` is independent of `isValidPhotoSet` and `angleWarning`.',
  '',
  'ANALYSIS & VALUATION RULES:',
  '• Brand/Model/Colorway/Size: Read from whichever photo gives the clearest view under good lighting (especially tongue/insole size tag). Size must be a plain US MEN\'S size number string like "10" or "10.5" — if the tag only shows a women\'s or EU size, convert it to US Men\'s first. Never return a bare women\'s size.',
  '• Category: Can only be any of the following: running, basketball, football, casual, lifestyle, skate, training, other. Category is based on the classification of the shoe, and must be in small characters.',
  '• Condition & Defects: Set conditionScore (0-10, where 10 = brand new/unworn) based on the worse shoe of the pair. Prefix each defect entry with "Left: ", "Right: ", or "Both: ".',
  '• Estimated Price: Estimate typical brand-new retail price in PHP for this shoe model.',
  '• Year: Provide a valid Gregorian calendar year (e.g., 2026, 2016, 2006) of the release of the model.',
].join('\n');

/** Structured-output schema handed to Gemini. Mirrors `RawShoeAnalysis`. */
export const SHOE_ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isValidPhotoSet: { type: 'BOOLEAN' },
    rejectionReason: { type: 'STRING' },
    isSameShoeThroughout: { type: 'BOOLEAN' },
    mismatchReason: { type: 'STRING' },
    angleWarning: { type: 'STRING' },
    brand: { type: 'STRING' },
    model: { type: 'STRING' },
    colorway: { type: 'STRING' },
    size: { type: 'STRING' },
    category: { type: 'STRING' },
    year: { type: 'NUMBER' },
    conditionScore: { type: 'NUMBER' },
    description: { type: 'STRING' },
    defects: { type: 'ARRAY', items: { type: 'STRING' } },
    estimatedPrice: { type: 'NUMBER' },
  },
  required: [
    'isValidPhotoSet',
    'rejectionReason',
    'isSameShoeThroughout',
    'mismatchReason',
    'angleWarning',
    'brand',
    'model',
    'colorway',
    'size',
    'category',
    'year',
    'conditionScore',
    'description',
    'defects',
    'estimatedPrice',
  ],
};

/** What Gemini returns: the analysis plus the gate flags that never leave this module. */
type RawShoeAnalysis = ShoeAnalysis & {
  isValidPhotoSet: boolean;
  rejectionReason: string;
  isSameShoeThroughout: boolean;
  mismatchReason: string;
  angleWarning: string;
};

/**
 * Shown only when the model returns a blank reason — normally its own message is used, since that
 * one can name the offending slot. Keep the tone matched to WRITING MESSAGES TO THE SELLER.
 */
const NOT_A_SHOE = "We couldn't spot a shoe in one of your photos. Please check all 6 photos and retake any that don't clearly show your pair.";
const DIFFERENT_SHOE = 'One of your photos looks like a different shoe. Please make sure all 6 photos are of the same pair, then try again.';

/**
 * Turns Gemini's raw JSON into a `ShoeAnalysis`, rejecting photo sets that fail either gate.
 *
 * The validity gate runs first: a photo that isn't a shoe at all also trips the consistency check,
 * and "that isn't a shoe" is the more actionable message of the two.
 */
export function interpretAnalysisResponse(resultText: string): ShoeAnalysis {
  const parsed = JSON.parse(resultText) as RawShoeAnalysis;

  if (!parsed.isValidPhotoSet) {
    throw new InvalidShoePhotoError(parsed.rejectionReason || NOT_A_SHOE);
  }

  if (!parsed.isSameShoeThroughout) {
    throw new InvalidShoePhotoError(parsed.mismatchReason || DIFFERENT_SHOE);
  }

  // Valid sets repurpose `rejectionReason` as a non-blocking lighting tip. The gate fields are
  // destructured purely to strip them from `analysis` — they must not reach API clients.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isValidPhotoSet, rejectionReason, isSameShoeThroughout, mismatchReason, angleWarning, ...analysis } = parsed;
  return { ...analysis, lightingWarning: rejectionReason || undefined, angleWarning: angleWarning || undefined };
}
