import { useEffect, useRef } from 'react';
import { useSellStore } from '@/store/sell';
import type { PhotoAngle } from '../types/sell.types';
import { sellService } from '../services/sell.service';

const PHOTO_ANGLES: PhotoAngle[] = ['top', 'side', 'soles', 'insoles'];

export function useAiAnalysis() {
  const { photos, setIsAnalyzing, setAnalysisError, setAiResult } = useSellStore();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const remoteUrls = {} as Record<PhotoAngle, string>;
    for (const angle of PHOTO_ANGLES) {
      const url = photos[angle]?.remoteUrl;
      if (!url) {
        setIsAnalyzing(false);
        setAnalysisError('Photos are not fully uploaded yet. Please go back and retry.');
        return;
      }
      remoteUrls[angle] = url;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    sellService
      .analyzePhotos(remoteUrls)
      .then(({ result, analysisId }) => {
        setAiResult(result, analysisId);
      })
      .catch((err: unknown) => {
        setIsAnalyzing(false);
        setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      });
  }, []);
}
