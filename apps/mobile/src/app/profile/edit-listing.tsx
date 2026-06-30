import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
};

type Condition = 'New' | 'Like New' | 'Good' | 'Fair';
type ListingType = 'Sell' | 'Swap' | 'Both';

const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair'];
const TYPES: ListingType[] = ['Sell', 'Swap', 'Both'];

const CONDITION_COLORS: Record<Condition, string> = {
  New: '#10B981',
  'Like New': '#3B82F6',
  Good: '#F59E0B',
  Fair: '#9CA3AF',
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 8 }}>
      {children.toUpperCase()}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-500 mb-1.5">{label}</Text>
      <View
        className="bg-white rounded-xl overflow-hidden border border-gray-100"
        style={CARD_SHADOW}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#D1D5DB"
          multiline={multiline}
          keyboardType={keyboardType ?? 'default'}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          className="px-4 py-3 text-sm text-gray-900"
          style={multiline ? { minHeight: 96 } : undefined}
        />
      </View>
    </View>
  );
}

export default function EditListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    size: string;
    price: string;
  }>();

  const rawPrice = (params.price ?? '').replace(/[₱,]/g, '');

  const [name, setName] = useState(params.name ?? '');
  const [size, setSize] = useState(params.size ?? '');
  const [price, setPrice] = useState(rawPrice);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [type, setType] = useState<ListingType>('Sell');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the listing.');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Required', 'Please enter a valid price.');
      return;
    }

    setSaving(true);
    // Simulate save delay — replace with real API call
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Listing Updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 800);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SubScreenHeader title="Edit Listing" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic details */}
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
          <SectionLabel>Shoe Details</SectionLabel>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Nike Air Max 90" />
          <Field label="Size" value={size} onChangeText={setSize} placeholder="e.g. US 10" />
          <Field
            label="Asking Price (₱)"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 4500"
            keyboardType="numeric"
          />
        </View>

        {/* Condition */}
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
          <SectionLabel>Condition</SectionLabel>
          <View className="flex-row gap-2 flex-wrap">
            {CONDITIONS.map((c) => {
              const active = condition === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCondition(c)}
                  activeOpacity={0.75}
                  className="flex-row items-center rounded-full px-3 py-2"
                  style={{
                    backgroundColor: active ? CONDITION_COLORS[c] + '18' : '#F9FAFB',
                    borderWidth: 1.5,
                    borderColor: active ? CONDITION_COLORS[c] : '#E5E7EB',
                  }}
                >
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: active ? CONDITION_COLORS[c] : '#D1D5DB' }}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? CONDITION_COLORS[c] : '#9CA3AF' }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Listing type */}
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
          <SectionLabel>Listing Type</SectionLabel>
          <View className="flex-row bg-gray-100 rounded-2xl p-1">
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                activeOpacity={0.75}
                className="flex-1 items-center py-2.5 rounded-xl"
                style={{ backgroundColor: type === t ? '#fff' : 'transparent', ...( type === t ? CARD_SHADOW : {}) }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: type === t ? '#111827' : '#9CA3AF' }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl p-4 mb-4" style={CARD_SHADOW}>
          <SectionLabel>Description</SectionLabel>
          <Field
            label=""
            value={description}
            onChangeText={setDescription}
            placeholder="Add any details about condition, wear history, inclusions..."
            multiline
          />
        </View>
      </ScrollView>

      {/* Save button */}
      <View className="px-5 pb-8 pt-3 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
          className="rounded-2xl py-4 items-center flex-row justify-center"
          style={{
            backgroundColor: saving ? '#93C5FD' : '#2563EB',
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {saving ? (
            <Text className="text-white font-bold text-base">Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
