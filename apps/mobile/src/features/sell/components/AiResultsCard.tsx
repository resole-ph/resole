import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AiAnalysisResult } from '../types/sell.types';

interface AiResultsCardProps {
  result: AiAnalysisResult;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-outline-variant">
      <Text className="font-label-md text-label-md text-on-surface-variant">{label}</Text>
      <Text className="font-body-md text-body-md text-on-surface">{value}</Text>
    </View>
  );
}

export default function AiResultsCard({ result }: AiResultsCardProps) {
  return (
    <View className="gap-4">
      {/* Valuation banner */}
      <View
        className="rounded-2xl bg-primary p-4"
        style={{
          shadowColor: '#0054d3',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="auto-awesome" size={16} color="rgba(255,255,255,0.8)" />
          <Text className="font-label-md text-label-md text-on-primary" style={{ opacity: 0.8 }}>
            AI VALUATION
          </Text>
        </View>
        <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary">
          ₱{result.suggestedPriceLow.toLocaleString()} – ₱{result.suggestedPriceHigh.toLocaleString()}
        </Text>
        <Text className="font-body-md text-body-md text-on-primary mt-0.5" style={{ opacity: 0.75 }}>
          Suggested: ₱{result.suggestedPrice.toLocaleString()}
        </Text>
      </View>

      {/* Identified details */}
      <View
        className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <MaterialIcons name="manage-search" size={18} color="#0054d3" />
          <Text className="font-title-md text-title-md text-on-surface">
            AI-Identified Details
          </Text>
        </View>

        <DetailRow label="Brand" value={result.brand} />
        <DetailRow label="Model" value={result.model} />
        <DetailRow label="Colorway" value={result.colorway} />
        <DetailRow label="Size" value={result.size} />
        <DetailRow label="Year" value={String(result.year)} />

        <View className="flex-row items-center justify-between pt-2">
          <Text className="font-label-md text-label-md text-on-surface-variant">Condition</Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-secondary-container rounded-full px-3 py-1">
              <Text className="font-label-md text-label-md text-primary">
                {result.conditionLabel}
              </Text>
            </View>
            <Text className="font-body-md text-body-md text-on-surface">
              {result.conditionRating}/10
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
