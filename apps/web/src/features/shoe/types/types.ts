import { shoe, shoePrice, shoeListing } from '@/db/schema';
import { User } from '@/features/auth/types/types';

export type Shoe = typeof shoe.$inferSelect;
export type CreateShoe = typeof shoe.$inferInsert;
export type UpdateShoe = Partial<Shoe>;

type InferShoePrice = typeof shoePrice.$inferSelect;
export type ShoePrice = Omit<InferShoePrice, 'shoeId'> & { shoe: Shoe };
export type CreateShoePrice = typeof shoePrice.$inferInsert;
export type UpdateShoePrice = Partial<InferShoePrice>;

type InferShoeListing = typeof shoeListing.$inferSelect;
export type ShoeListing = Omit<InferShoeListing, 'shoeId' | 'userId'> & { shoe: Shoe, user: User };
export type CreateShoeListing = typeof shoeListing.$inferInsert;
export type UpdateShoeListing = Partial<InferShoeListing>;

/** Structured output extracted from the four shoe photos by Gemini. */
export interface ShoeAnalysis {
  brand: string;
  model: string;
  colorway: string;
  /** US size as read from the shoe (e.g. "10" or "10.5"). */
  size: string;
  /** Estimated release/production year. Not persisted — display only. */
  year: number;
  /** Condition on a 0–10 scale (10 = brand new). */
  conditionScore: number;
  description: string;
  defects: string[];
  /** Gemini's own brand-new / market baseline price estimate in PHP. */
  estimatedPrice: number;
}

/** Result of the pgvector baseline lookup + depreciation math. */
export interface ShoePricing {
  /** Catalog baseline (from shoe_price) when a confident match was found, else null. */
  baselinePrice: number | null;
  matchedShoeId: number | null;
  similarity: number | null;
  conditionScore: number;
  /** Final condition-adjusted price: baseline * (conditionScore / 10). */
  suggestedPrice: number;
  /** Whether suggestedPrice was derived from the catalog or the AI estimate fallback. */
  priceSource: 'catalog' | 'ai-estimate';
}

/** Combined analyze endpoint response payload. */
export interface ShoeAnalysisResult extends ShoeAnalysis {
  pricing: ShoePricing;
}