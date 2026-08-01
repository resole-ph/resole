import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import type { AiAnalysisResult } from '../types/sell.types';
import { usePreferencesStore } from '@/store/preferences';
import { SIZE_SYSTEMS, SIZE_SYSTEM_LABELS, formatSize } from '@/features/shoe/utils/size-conversion';

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

function formatPrice(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AiResultsCard({ result }: AiResultsCardProps) {
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  const setSizeSystem = usePreferencesStore((s) => s.setSizeSystem);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  return (
    <View className="gap-4">
      {/* Lighting warning */}
      {result.lightingWarning && (
        <View
          className="flex-row items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <MaterialIcons name="warning-amber" size={20} color="#F59E0B" />
          <Text className="font-body-md text-body-md flex-1" style={{ color: '#92400E' }}>
            {result.lightingWarning}
          </Text>
        </View>
      )}

      {/* Angle mismatch warning */}
      {result.angleWarning && (
        <View
          className="flex-row items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <MaterialIcons name="warning-amber" size={20} color="#F59E0B" />
          <Text className="font-body-md text-body-md flex-1" style={{ color: '#92400E' }}>
            {result.angleWarning}
          </Text>
        </View>
      )}

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
          ₱{formatPrice(result.suggestedPriceLow)} – ₱{formatPrice(result.suggestedPriceHigh)}
        </Text>
        <Text className="font-body-md text-body-md text-on-primary mt-0.5" style={{ opacity: 0.75 }}>
          Suggested: ₱{formatPrice(result.suggestedPrice)}
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

        {/* Size, with a dropdown to change the display system */}
        <View className="flex-row items-center justify-between py-2 border-b border-outline-variant">
          <Text className="font-label-md text-label-md text-on-surface-variant">Size</Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-body-md text-body-md text-on-surface">
              {formatSize(Number(result.size), sizeSystem)}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSizeMenu(true)}
              activeOpacity={0.7}
              className="flex-row items-center gap-0.5 rounded-full px-2 py-1 bg-secondary-container"
            >
              <Text className="font-label-md text-label-md text-primary">
                {SIZE_SYSTEM_LABELS[sizeSystem]}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#0054d3" />
            </TouchableOpacity>
          </View>
        </View>

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

      {/* Size system picker */}
      <Modal visible={showSizeMenu} transparent animationType="slide" onRequestClose={() => setShowSizeMenu(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setShowSizeMenu(false)}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: 32 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 8 }}>
            Shoe size system
          </Text>
          {SIZE_SYSTEMS.map((system) => (
            <TouchableOpacity
              key={system}
              className="flex-row items-center px-5 py-3.5"
              activeOpacity={0.7}
              onPress={() => {
                setSizeSystem(system);
                setShowSizeMenu(false);
              }}
            >
              <Text
                className="flex-1 text-gray-900 text-sm"
                style={{ fontWeight: system === sizeSystem ? '700' : '400' }}
              >
                {SIZE_SYSTEM_LABELS[system]}
              </Text>
              {system === sizeSystem && <Ionicons name="checkmark" size={18} color="#2563EB" />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}
