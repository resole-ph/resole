import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import SellStepHeader from '../components/SellStepHeader';
import StepFooter from '../components/StepFooter';
import AiResultsCard from '../components/AiResultsCard';
import { useSellFlow } from '../hooks/useSellFlow';
import { useAiAnalysis } from '../hooks/useAiAnalysis';

function LoadingDots() {
  const dots = [useSharedValue(0.3), useSharedValue(0.3), useSharedValue(0.3)];

  useEffect(() => {
    dots.forEach((dot, i) => {
      dot.value = withRepeat(
        withTiming(1, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          delay: i * 160,
        } as any),
        -1,
        true
      );
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-6 px-8">
      <View className="w-16 h-16 rounded-full bg-secondary-container items-center justify-center">
        <MaterialIcons name="auto-awesome" size={32} color="#0054d3" />
      </View>
      <View>
        <Text className="font-title-md text-title-md text-on-surface text-center mb-1">
          Analyzing your shoes...
        </Text>
        <Text className="font-body-md text-body-md text-on-surface-variant text-center">
          Our AI is identifying details and estimating value.
        </Text>
      </View>
      <View className="flex-row gap-2 items-center">
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary"
            style={useAnimatedStyle(() => ({ opacity: dot.value }))}
          />
        ))}
      </View>
    </View>
  );
}

export default function AiResultsContainer() {
  const router = useRouter();
  const { isAnalyzing, analysisError, aiResult, setIsAnalyzed, initFormFromAiResult, setStep, goBack, confirmDiscard } = useSellFlow();
  const slideIn = useSharedValue(40);
  const opacity = useSharedValue(0);

  useAiAnalysis();

  useEffect(() => {
    if (aiResult) {
      slideIn.value = withSpring(0, { damping: 16, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
      setIsAnalyzed(true);
    }
  }, [aiResult]);

  const resultStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: slideIn.value }],
  }));

  function handleContinue() {
    initFormFromAiResult();
    setStep('editListing');
  }

  return (
    <View className="flex-1 bg-surface">
      <SellStepHeader title="AI Results" stepLabel="Step 2 of 4" onBack={goBack} />

      {isAnalyzing && <LoadingDots />}

      {analysisError && (
        <>
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <MaterialIcons name="error-outline" size={48} color="#ba1a1a" />
            <Text className="font-body-md text-body-md text-error text-center">{analysisError}</Text>
          </View>

          <StepFooter
            onCancel={() => confirmDiscard(() => router.back())}
            onPrimary={goBack}
            primaryLabel="Go Back"
          />
        </>
      )}

      {aiResult && (
        <>
          <Animated.ScrollView
            style={resultStyle}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              <Text className="font-title-md text-title-md text-on-surface mb-1">
                Here's what we found
              </Text>
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Review the details and continue to finalize your listing.
              </Text>
            </View>
            <AiResultsCard result={aiResult} />
          </Animated.ScrollView>

          <StepFooter
            onCancel={() => confirmDiscard(() => router.back())}
            onPrimary={handleContinue}
            primaryLabel="Next"
          />
        </>
      )}
    </View>
  );
}
