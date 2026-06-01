import type { AiAnalysisResult } from '../types/sell.types';

export const MOCK_AI_RESULT: AiAnalysisResult = {
  brand: 'Nike',
  model: 'Air Jordan 1 Retro High OG',
  colorway: 'Chicago',
  size: 'US 10',
  year: 2015,
  conditionLabel: 'Excellent',
  conditionRating: 8,
  suggestedPriceLow: 8500,
  suggestedPriceHigh: 11500,
  suggestedPrice: 10000,
  currency: 'PHP',
};

export const MOCK_AI_ANALYSIS_ID = 'mock-analysis-id-001';

export const MOCK_ANALYSIS_DELAY_MS = 2800;
