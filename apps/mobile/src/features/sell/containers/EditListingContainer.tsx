import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import SellStepHeader from '../components/SellStepHeader';
import ConditionSlider from '../components/ConditionSlider';
import PriceInput from '../components/PriceInput';
import { useSellFlow } from '../hooks/useSellFlow';
import type { ListingMode } from '../types/sell.types';

const MODE_OPTIONS: { id: ListingMode; label: string }[] = [
  { id: 'sell', label: 'Sell' },
  { id: 'swap', label: 'Swap' },
  { id: 'both', label: 'Both' },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="font-label-md text-label-md text-on-surface-variant mb-2 mt-1">
      {children.toUpperCase()}
    </Text>
  );
}

function StyledInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#727687"
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        className="py-3 px-4 font-body-md text-body-md text-on-surface"
        style={multiline ? { minHeight: 96 } : undefined}
      />
    </View>
  );
}

export default function EditListingContainer() {
  const router = useRouter();
  const { form, updateFormField, priceAllowedRange, conditionAllowedRange, ratingToLabel, setStep, goBack } = useSellFlow();

  if (!form) return null;

  const { min: priceMin, max: priceMax } = priceAllowedRange();
  const { min: condMin, max: condMax } = conditionAllowedRange();

  function handleConditionChange(v: number) {
    updateFormField('conditionRating', v);
    updateFormField('conditionLabel', ratingToLabel(v));
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SellStepHeader
        title="Edit Listing"
        stepLabel="Step 3 of 4"
        onBack={goBack}
        onClose={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shoe details */}
        <View
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <SectionLabel>Shoe Details</SectionLabel>
          <View className="gap-2">
            <StyledInput
              value={form.brand}
              onChangeText={(v) => updateFormField('brand', v)}
              placeholder="Brand"
            />
            <StyledInput
              value={form.model}
              onChangeText={(v) => updateFormField('model', v)}
              placeholder="Model"
            />
            <StyledInput
              value={form.colorway}
              onChangeText={(v) => updateFormField('colorway', v)}
              placeholder="Colorway"
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <StyledInput
                  value={form.size}
                  onChangeText={(v) => updateFormField('size', v)}
                  placeholder="Size (e.g. US 10)"
                />
              </View>
              <View className="flex-1">
                <StyledInput
                  value={form.year}
                  onChangeText={(v) => updateFormField('year', v)}
                  placeholder="Year"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Condition */}
        <View
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <SectionLabel>Condition</SectionLabel>
            <View className="bg-secondary-container rounded-full px-3 py-0.5">
              <Text className="font-label-md text-label-md text-primary">{form.conditionLabel}</Text>
            </View>
          </View>
          <ConditionSlider
            value={form.conditionRating}
            min={condMin}
            max={condMax}
            onChange={handleConditionChange}
          />
          <Text className="font-label-md text-label-md text-on-surface-variant mt-2">
            ±15% of AI-suggested rating
          </Text>
        </View>

        {/* Price */}
        <View
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <SectionLabel>Asking Price</SectionLabel>
          <PriceInput
            value={form.price}
            onChange={(v) => updateFormField('price', v)}
            minPrice={priceMin}
            maxPrice={priceMax}
          />
        </View>

        {/* Listing type */}
        <View
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <SectionLabel>Listing Type</SectionLabel>
          <View
            className="flex-row rounded-full bg-surface-container-low p-1"
            style={{ borderWidth: 1, borderColor: '#e0e2ec' }}
          >
            {MODE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => updateFormField('mode', opt.id)}
                className="flex-1 py-2 rounded-full items-center"
                style={{ backgroundColor: form.mode === opt.id ? '#ffffff' : 'transparent' }}
              >
                <Text
                  className="font-body-md text-body-md"
                  style={{ color: form.mode === opt.id ? '#1a1c20' : '#727687' }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <SectionLabel>Description (optional)</SectionLabel>
          <StyledInput
            value={form.description}
            onChangeText={(v) => updateFormField('description', v)}
            placeholder="Add any extra details about your shoes..."
            multiline
          />
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-4 pb-8 pt-2">
        <TouchableOpacity
          onPress={() => setStep('review')}
          className="bg-primary rounded-full py-4 items-center"
          style={{
            shadowColor: '#0054d3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="font-body-md text-body-md text-on-primary">Review Listing</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
