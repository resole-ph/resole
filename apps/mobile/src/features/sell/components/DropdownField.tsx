import { useState } from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';

interface DropdownFieldProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  title?: string;
  error?: string;
}

export default function DropdownField({
  value,
  options,
  onSelect,
  placeholder = 'Select',
  title = 'Select an option',
  error,
}: DropdownFieldProps) {
  const [open, setOpen] = useState(false);

  // The current value might not be one of the curated options (e.g. an
  // AI-detected colorway spelled differently) — show it anyway so nothing
  // the user already picked silently disappears from the list.
  const allOptions = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <View className="gap-1">
      <GuardedTouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between bg-surface-container-lowest border rounded-xl px-4 py-3"
        style={{ borderColor: error ? '#ba1a1a' : '#c2c6d8' }}
      >
        <Text className={`font-body-md text-body-md ${value ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#727687" />
      </GuardedTouchableOpacity>
      {error && <Text className="font-label-md text-label-md text-error">{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <GuardedTouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, maxHeight: '70%' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 8 }}>
            {title}
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {allOptions.map((opt) => (
              <GuardedTouchableOpacity
                key={opt}
                className="flex-row items-center px-5 py-3.5"
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text className="flex-1 text-gray-900 text-sm" style={{ fontWeight: opt === value ? '700' : '400' }}>
                  {opt}
                </Text>
                {opt === value && <Ionicons name="checkmark" size={18} color="#2563EB" />}
              </GuardedTouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
