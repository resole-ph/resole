import { useEffect, useRef } from 'react';
import { useSellStore } from '@/store/sell';
import type { PhotoAngle } from '../types/sell.types';
import { sellService } from '../services/sell.service';

const PHOTO_ANGLES: PhotoAngle[] = ['top', 'leftSide', 'rightSide', 'sole', 'insoleRight', 'insoleLeft'];

export function useAiAnalysis() {
  const { photos, aiResult, setIsAnalyzing, setAnalysisError, setAiResult } = useSellStore();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    // Navigating back to this step (e.g. from Edit Listing) remounts this
    // component and would otherwise re-trigger analysis even though the
    // result from the first pass is still sitting in the store.
    if (aiResult) return;

    const remoteUrls = {} as Record<PhotoAngle, string>;
    for (const angle of PHOTO_ANGLES) {
      const url = photos[angle]?.remoteUrl;
      if (!url) {
        setIsAnalyzing(false);
        setAnalysisError('Your photos are still uploading. Please go back and try again in a moment.');
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
        setAnalysisError(
          err instanceof Error
            ? err.message
            : "We couldn't analyze your photos just now. Please go back and try again in a moment."
        );
      });
  }, []);
}
