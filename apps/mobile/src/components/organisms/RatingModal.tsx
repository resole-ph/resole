import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface RatingModalProps {
  visible: boolean;
  targetName: string;
  submitting: boolean;
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export default function RatingModal({ visible, targetName, submitting, onSubmit, onSkip }: RatingModalProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (rating === 0 || submitting) return;
    onSubmit(rating, comment.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={submitting ? undefined : onSkip} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>Rate your transaction</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>How was your deal with {targetName}?</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} disabled={submitting}>
                <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={34} color="#F59E0B" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Comment (optional)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share more about your experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={500}
            editable={!submitting}
            style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 80, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 20 }}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={rating === 0 || submitting}
            style={{ backgroundColor: rating > 0 ? '#2563EB' : '#E5E7EB', borderRadius: 18, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}
            activeOpacity={rating > 0 ? 0.85 : 1}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="star" size={18} color={rating > 0 ? '#fff' : '#9CA3AF'} />
                <Text style={{ color: rating > 0 ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: '700' }}>Submit Rating</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkip} disabled={submitting} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600' }}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
