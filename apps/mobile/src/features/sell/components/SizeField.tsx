import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencesStore } from '@/store/preferences';
import {
  SIZE_SYSTEMS,
  SIZE_SYSTEM_LABELS,
  MIN_US_MENS,
  MAX_US_MENS,
  convertFromUSMens,
  convertToUSMens,
  formatSizeValue,
  type SizeSystem,
} from '@/features/shoe/utils/size-conversion';

// The chart only spans US Men 3–16, so deriving the option list from its two
// ends (rather than hardcoding a range per system) keeps every system's
// dropdown bounded to sizes the conversion table can actually support.
function sizeOptionsFor(system: SizeSystem): number[] {
  const a = convertFromUSMens(MIN_US_MENS, system);
  const b = convertFromUSMens(MAX_US_MENS, system);
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const opts: number[] = [];
  for (let v = min; v <= max + 1e-6; v += 0.5) {
    opts.push(Math.round(v * 2) / 2);
  }
  return opts;
}

interface SizeFieldProps {
  /** Numeric string, in the currently-selected size system. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function SizeField({ value, onChange, error }: SizeFieldProps) {
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  const setSizeSystem = usePreferencesStore((s) => s.setSizeSystem);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);

  const options = sizeOptionsFor(sizeSystem);

  function handleSystemChange(nextSystem: SizeSystem) {
    // Re-express the currently entered size in the new system so the number
    // still means the same physical shoe size instead of being silently
    // reinterpreted (e.g. "9" under US Men suddenly meaning UK 9).
    if (value.trim()) {
      const usMens = convertToUSMens(Number(value), sizeSystem);
      onChange(formatSizeValue(convertFromUSMens(usMens, nextSystem)));
    }
    setSizeSystem(nextSystem);
    setShowSystemMenu(false);
  }

  return (
    <View className="gap-1">
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setShowSizeMenu(true)}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-between bg-surface-container-lowest border rounded-xl px-4 py-3"
          style={{ borderColor: error ? '#ba1a1a' : '#c2c6d8' }}
        >
          <Text className={`font-body-md text-body-md ${value ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {value || 'Select size'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#727687" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSystemMenu(true)}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 rounded-xl px-3 bg-secondary-container"
        >
          <Text className="font-label-md text-label-md text-primary">{SIZE_SYSTEM_LABELS[sizeSystem]}</Text>
          <Ionicons name="chevron-down" size={12} color="#0054d3" />
        </TouchableOpacity>
      </View>
      {error && <Text className="font-label-md text-label-md text-error">{error}</Text>}

      {/* Size value picker — intervals of 0.5 */}
      <Modal visible={showSizeMenu} transparent animationType="slide" onRequestClose={() => setShowSizeMenu(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setShowSizeMenu(false)}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, maxHeight: '70%' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 8 }}>
            Size ({SIZE_SYSTEM_LABELS[sizeSystem]})
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {options.map((opt) => {
              const label = formatSizeValue(opt);
              const isActive = value === label;
              return (
                <TouchableOpacity
                  key={opt}
                  className="flex-row items-center px-5 py-3.5"
                  activeOpacity={0.7}
                  onPress={() => {
                    onChange(label);
                    setShowSizeMenu(false);
                  }}
                >
                  <Text className="flex-1 text-gray-900 text-sm" style={{ fontWeight: isActive ? '700' : '400' }}>
                    {label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#2563EB" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Size system picker */}
      <Modal visible={showSystemMenu} transparent animationType="slide" onRequestClose={() => setShowSystemMenu(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setShowSystemMenu(false)}
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
              onPress={() => handleSystemChange(system)}
            >
              <Text className="flex-1 text-gray-900 text-sm" style={{ fontWeight: system === sizeSystem ? '700' : '400' }}>
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
