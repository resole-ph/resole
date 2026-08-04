import { View, Text, Modal } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { Charity } from '@/features/charity/types/charity.types';

interface DonateSheetProps {
  visible: boolean;
  charity: Charity | null;
  onClose: () => void;
}

export default function DonateSheet({ visible, charity, onClose }: DonateSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <GuardedTouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, alignItems: 'center' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <View
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}
          >
            <Ionicons name="heart" size={26} color="#2563EB" />
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', letterSpacing: 0.5, marginBottom: 4 }}>
            COMING SOON
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' }}>
            Donate to {charity?.name ?? 'this cause'}
          </Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 }}>
            We're still building donations. Soon you'll be able to send proceeds straight to {charity?.name ?? 'this charity'}.
          </Text>

          <GuardedTouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{ backgroundColor: '#2563EB', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Got it</Text>
          </GuardedTouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
