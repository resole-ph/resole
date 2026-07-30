import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SellStepHeader from '../components/SellStepHeader';
import StepFooter from '../components/StepFooter';
import ConditionSlider, { getConditionTone } from '../components/ConditionSlider';
import PriceInput from '../components/PriceInput';
import DropdownField from '../components/DropdownField';
import SizeField from '../components/SizeField';
import { useSellFlow } from '../hooks/useSellFlow';
import type { ListingMode } from '../types/sell.types';
import { validateListingForm } from '../utils/validation';

const COLORWAY_OPTIONS = [
  'White',
  'Black',
  'White/Black',
  'Black/White',
  'Grey',
  'Red',
  'Blue',
  'Navy',
  'Green',
  'Brown',
  'Beige',
  'Pink',
  'Yellow',
  'Orange',
  'Purple',
  'Multi-Color',
];

function listingModeDescription(mode: ListingMode) {
  switch (mode) {
    case 'sell':
      return "You're listing this pair for a fixed price — buyers can purchase it directly at the price you set below.";
    case 'swap':
      return "You're listing this pair for trade — other users can propose swapping their own pair for yours instead of paying cash.";
    case 'both':
      return "You're open to both — buyers can purchase this pair at your asking price or propose a swap, whichever works for them.";
  }
}

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
  error,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
  error?: string;
}) {
  return (
    <View className="gap-1">
      <View
        className="bg-surface-container-lowest border rounded-xl overflow-hidden"
        style={{ borderColor: error ? '#ba1a1a' : '#c2c6d8' }}
      >
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
      {error && <Text className="font-label-md text-label-md text-error">{error}</Text>}
    </View>
  );
}

export default function EditListingContainer() {
  const router = useRouter();
  const { form, aiResult, updateFormField, priceAllowedRange, ratingToLabel, setStep, goBack } = useSellFlow();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!form) return null;

  const priceRange = priceAllowedRange();
  const aiConditionRating = aiResult?.conditionRating ?? form.conditionRating;
  const conditionTone = getConditionTone(form.conditionRating, aiConditionRating, 1, 10);
  const errors = validateListingForm(form);
  const canContinue = Object.keys(errors).length === 0;

  function handleConditionChange(v: number) {
    updateFormField('conditionRating', v);
    updateFormField('conditionLabel', ratingToLabel(v));
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : (keyboardVisible ? 'height' : undefined)} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SellStepHeader title="Edit Listing" stepLabel="Step 3 of 4" onBack={goBack} />

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
              error={errors.brand}
            />
            <StyledInput
              value={form.model}
              onChangeText={(v) => updateFormField('model', v)}
              placeholder="Model"
              error={errors.model}
            />
            <DropdownField
              value={form.colorway}
              options={COLORWAY_OPTIONS}
              onSelect={(v) => updateFormField('colorway', v)}
              placeholder="Colorway"
              title="Select a colorway"
              error={errors.colorway}
            />
            <SizeField
              value={form.size}
              onChange={(v) => updateFormField('size', v)}
              error={errors.size}
            />
            <StyledInput
              value={form.year}
              onChangeText={(v) => updateFormField('year', v.replace(/[^0-9]/g, ''))}
              placeholder="Year"
              keyboardType="numeric"
              error={errors.year}
            />
          </View>
        </View>

        {/* Condition — the whole card is tinted by how the rating compares to
            the AI's estimate, so the feedback reads at a glance, not just from
            the number/label. Kept subtle (low-alpha wash + border) so it stays
            a hint, not an error state. */}
        <View
          className="rounded-2xl p-4 mb-4"
          style={{
            backgroundColor: `${conditionTone.color}12`,
            borderWidth: 1.5,
            borderColor: `${conditionTone.color}45`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <SectionLabel>Condition</SectionLabel>
          <View className="items-center mb-5">
            <View
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                borderWidth: 6,
                borderColor: conditionTone.color,
                backgroundColor: `${conditionTone.color}14`,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: conditionTone.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 30, fontWeight: '800', color: conditionTone.color, lineHeight: 34 }}>
                {form.conditionRating}
                <Text style={{ fontSize: 15, fontWeight: '700' }}>/10</Text>
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: conditionTone.color, marginTop: 10 }}>
              {form.conditionLabel}
            </Text>
          </View>
          <ConditionSlider
            value={form.conditionRating}
            min={1}
            max={10}
            aiValue={aiConditionRating}
            onChange={handleConditionChange}
          />
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
            minPrice={priceRange?.min}
            maxPrice={priceRange?.max}
            error={errors.price}
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
          <View className="gap-3">
            {(['sell', 'swap'] as const).map((type) => {
              const mode = form.mode;
              const checked = mode === type || mode === 'both';
              const label = type === 'sell' ? 'Sell' : 'Swap';
              const subtitle = type === 'sell' ? 'List for a fixed price' : 'Trade for another pair';
              function toggle() {
                const otherChecked = type === 'sell'
                  ? (mode === 'swap' || mode === 'both')
                  : (mode === 'sell' || mode === 'both');
                if (checked && !otherChecked) return;
                if (checked) updateFormField('mode', type === 'sell' ? 'swap' : 'sell');
                else updateFormField('mode', otherChecked ? 'both' : type);
              }
              return (
                <TouchableOpacity
                  key={type}
                  onPress={toggle}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 p-3 rounded-2xl"
                  style={{
                    backgroundColor: checked ? '#f2f3ff' : '#ffffff',
                    borderWidth: 1,
                    borderColor: checked ? '#0054d3' : '#e0e2ec',
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: checked ? '#0054d3' : '#c2c6d8',
                      backgroundColor: checked ? '#0054d3' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {checked && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-md text-body-md text-on-surface">{label}</Text>
                    <Text className="font-label-md text-label-md text-on-surface-variant">{subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row items-start gap-2 mt-3 p-3 rounded-xl bg-secondary-container">
            <Ionicons name="information-circle-outline" size={16} color="#0054d3" style={{ marginTop: 1 }} />
            <Text className="flex-1 font-label-md text-label-md text-primary">
              {listingModeDescription(form.mode)}
            </Text>
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

      <StepFooter
        onCancel={() => router.back()}
        onPrimary={() => canContinue && setStep('review')}
        primaryLabel="Next"
        primaryDisabled={!canContinue}
        helperText={!canContinue ? `${Object.values(errors)[0]} Please fix the highlighted fields to continue.` : undefined}
        helperTextError
      />
    </KeyboardAvoidingView>
  );
}
