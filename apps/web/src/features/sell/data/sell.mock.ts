import type { AiAnalysisResult } from '../types/sell.types';

export const MOCK_AI_RESULT: AiAnalysisResult = {
  brand: 'Nike',
  model: 'Air Jordan 1 Retro High OG',
  conditionScore: 8,
  description:
    'Light creasing on the toe box, minor scuffing on the outsole, insole shows normal wear. No major defects.',
  estimatedPrice: 10000,
};

export const MOCK_ANALYSIS_DELAY_MS = 2200;
export const MOCK_PUBLISH_DELAY_MS = 900;
export const MOCK_LISTING_ID = 'PREVIEW-001';
