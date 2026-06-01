import { useEffect, useRef } from 'react';
import { useSellStore } from '@/store/sell';
import { sellService } from '../services/sell.service';

export function useAiAnalysis() {
  const { setIsAnalyzing, setAnalysisError, setAiResult } = useSellStore();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    setIsAnalyzing(true);
    setAnalysisError(null);

    sellService
      .analyzePhotos([])
      .then(({ result, analysisId }) => {
        setAiResult(result, analysisId);
      })
      .catch((err: unknown) => {
        setIsAnalyzing(false);
        setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      });
  }, []);
}
