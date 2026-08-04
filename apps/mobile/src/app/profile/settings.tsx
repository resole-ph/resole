import { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Switch, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { authService } from '@/features/auth/services/auth.service';
import { UserService } from '@/features/user/services/user.service';
import { useUpdateSizeSystem, useUserSettings } from '@/features/user/queries/user.queries';
import { useOnboardingStore } from '@/store/onboarding';
import { usePreferencesStore } from '@/store/preferences';
import { isStrongPassword, PASSWORD_REQUIREMENT_MESSAGE } from '@/features/auth/validation';
import {
  SIZE_SYSTEMS,
  SIZE_SYSTEM_LABELS,
  sizeSystemFromUserPreferences,
  type SizeSystem,
} from '@/features/shoe/utils/size-conversion';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type NotifKey = 'messages' | 'offers' | 'promos' | 'recycleReminders';

const ACCOUNT_FIELDS = [
  { id: 'name',     label: 'Full name',     value: '', icon: 'person-outline' as const },
  { id: 'email',    label: 'Email',         value: '', icon: 'mail-outline' as const },
  { id: 'phone',    label: 'Phone',         value: '', icon: 'call-outline' as const },
  { id: 'location', label: 'Location',      value: '', icon: 'location-outline' as const },
  { id: 'unit',     label: 'Unit',          value: '', icon: 'cube' as const },
  { id: 'classification', label: 'Classification',  value: '', icon: 'male-female-outline' as const },
];

// TODO: replace with the real enums/labels from size-conversion.ts if it
// already exports something for these — don't want two sources of truth.
const UNIT_OPTIONS = ['us', 'uk', 'eu', 'cm'];
const CLASSIFICATION_OPTIONS = ["men", "women"];

function fieldOptions(fieldId: string): string[] | null {
  if (fieldId === 'unit') return UNIT_OPTIONS;
  if (fieldId === 'classification') return CLASSIFICATION_OPTIONS;
  return null;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide px-5 mt-5 mb-2">
      {title}
    </Text>
  );
}

function AccountRow({
  field,
  onPress,
}: {
  field: (typeof ACCOUNT_FIELDS)[number];
  onPress: () => void;
}) {
  return (
    <GuardedTouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={field.icon} size={16} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-400 text-xs">{field.label}</Text>
        <Text className="text-gray-900 font-medium text-sm mt-0.5">{field.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </GuardedTouchableOpacity>
  );
}

// Shared bottom sheet for editing a single account field. Renders a picker
// list for fields with options (unit, classification) and a text input for
// everything else. Deliberately never used for the Password row — changing a
// password should go through its own flow (current password verification,
// its own service call), not this generic "type a value, save" sheet.
function EditFieldModal({
  visible,
  field,
  onClose,
  onSave,
}: {
  visible: boolean;
  field: (typeof ACCOUNT_FIELDS)[number] | null;
  onClose: () => void;
  onSave: (id: string, value: string) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (field) setValue(field.value);
  }, [field]);

  if (!field) return null;

  const options = fieldOptions(field.id);

  const handleSave = async (nextValue: string) => {
    setSaving(true);
    try {
      await onSave(field.id, nextValue);
      onClose();
      Alert.alert(
        'Success!', 
        `Successfully saved changes to ${field.label.toLowerCase()}.`
      );
    } catch {
      // Parent already surfaces an Alert on failure — keep the sheet open
      // so the user can retry instead of losing what they typed.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GuardedTouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={onClose} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
            Edit {field.label}
          </Text>

          {options ? (
            <View style={{ marginBottom: 8 }}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <GuardedTouchableOpacity
                    key={option}
                    className="flex-row items-center py-3.5"
                    activeOpacity={0.7}
                    disabled={saving}
                    onPress={() => handleSave(option)}
                  >
                    <Text className="flex-1 text-gray-900 text-sm" style={{ fontWeight: selected ? '700' : '400' }}>
                      {option}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={18} color="#2563EB" />}
                  </GuardedTouchableOpacity>
                );
              })}
            </View>
          ) : (
            <>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={field.label}
                placeholderTextColor="#9CA3AF"
                autoFocus
                style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 20 }}
              />
              <GuardedTouchableOpacity
                onPress={() => handleSave(value)}
                disabled={saving || !value.trim()}
                activeOpacity={0.85}
                style={{
                  backgroundColor: saving || !value.trim() ? '#E5E7EB' : '#2563EB',
                  borderRadius: 18,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: saving || !value.trim() ? '#9CA3AF' : '#fff', fontSize: 16, fontWeight: '700' }}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </GuardedTouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Password change gets its own sheet with three fields and client-side
// validation, rather than reusing EditFieldModal — a password needs the
// current password re-entered plus a confirmation, not a single value swap.
function PasswordEditModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError(PASSWORD_REQUIREMENT_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave(currentPassword, newPassword);
      resetAndClose();
      Alert.alert(
        'Success!', 
        `Successfully changed password.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isValid = !!currentPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GuardedTouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={resetAndClose} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
            Change password
          </Text>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Current password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={(v) => { setCurrentPassword(v); setError(null); }}
            placeholder="Current password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16 }}
          />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={(v) => { setNewPassword(v); setError(null); }}
            placeholder="At least 8 characters"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16 }}
          />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Confirm new password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setError(null); }}
            placeholder="Re-enter new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: error ? 8 : 20 }}
          />

          {error && (
            <Text style={{ color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</Text>
          )}

          <GuardedTouchableOpacity
            onPress={handleSubmit}
            disabled={saving || !isValid}
            activeOpacity={0.85}
            style={{
              backgroundColor: saving || !isValid ? '#E5E7EB' : '#2563EB',
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: saving || !isValid ? '#9CA3AF' : '#fff', fontSize: 16, fontWeight: '700' }}>
              {saving ? 'Saving...' : 'Update password'}
            </Text>
          </GuardedTouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5 border-b border-gray-50">
      <View className="flex-1 mr-4">
        <Text className="text-gray-900 font-medium text-sm">{label}</Text>
        <Text className="text-gray-400 text-xs mt-0.5">{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
        thumbColor={value ? '#2563EB' : '#9CA3AF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

function PickerRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <GuardedTouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-sm">{label}</Text>
        <Text className="text-gray-400 text-xs mt-0.5">{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </GuardedTouchableOpacity>
  );
}

function SizeSystemModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: SizeSystem;
  onSelect: (system: SizeSystem) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GuardedTouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: 32 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 8 }}>
          Shoe size system
        </Text>
        {SIZE_SYSTEMS.map((system) => (
          <GuardedTouchableOpacity
            key={system}
            className="flex-row items-center px-5 py-3.5"
            activeOpacity={0.7}
            onPress={() => {
              onSelect(system);
              onClose();
            }}
          >
            <Text className="flex-1 text-gray-900 text-sm" style={{ fontWeight: system === current ? '700' : '400' }}>
              {SIZE_SYSTEM_LABELS[system]}
            </Text>
            {system === current && <Ionicons name="checkmark" size={18} color="#2563EB" />}
          </GuardedTouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

function ActionRow({
  label,
  icon,
  color = '#6B7280',
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <GuardedTouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icon} size={18} color={color} style={{ marginRight: 12 }} />
      <Text className="flex-1 font-medium text-sm" style={{ color }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </GuardedTouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    messages: true,
    offers: false,
    promos: false,
    recycleReminders: true,
  });
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  const setSizeSystem = usePreferencesStore((s) => s.setSizeSystem);
  const [showSizeSystemModal, setShowSizeSystemModal] = useState(false);
  const { mutateAsync: updateSizeSystem } = useUpdateSizeSystem();

  const { data: accountData, refetch: refetchAccount } = useUserSettings();

  const [editingField, setEditingField] = useState<(typeof ACCOUNT_FIELDS)[number] | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!accountData) return;
    const accountSizeSystem = sizeSystemFromUserPreferences(
      accountData.unit,
      accountData.classification,
    );
    if (accountSizeSystem) setSizeSystem(accountSizeSystem);
  }, [accountData, setSizeSystem]);

  async function handleSizeSystemChange(nextSystem: SizeSystem) {
    const previousSystem = sizeSystem;
    setSizeSystem(nextSystem);

    try {
      await updateSizeSystem(nextSystem);
    } catch (error) {
      setSizeSystem(previousSystem);
      Alert.alert(
        'Could not update shoe size system',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  }

  async function handleSaveField(id: string, value: string) {
    try {
      await UserService.editUser({ [id]: value });
      await refetchAccount();
    } catch (error) {
      Alert.alert(
        'Could not update',
        error instanceof Error ? error.message : 'Please try again.',
      );
      throw error;
    }
  }

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    // Surfacing the error message inline in the sheet (via the thrown error)
    // rather than an Alert here, since "wrong current password" etc. reads
    // better right next to the field than in a popup.
    await authService.changePassword({ currentPassword, newPassword });
  }

  // Built from the module-level ACCOUNT_FIELDS template rather than from
  // previous state. The old effect mapped over `accountFields`, which was `[]`
  // on first run and never repopulated — so this list always rendered empty.
  const accountFields = useMemo(
    () =>
      ACCOUNT_FIELDS.map((field) => ({
        ...field,
        value: accountData ? accountData[field.id] ?? '' : '',
      })),
    [accountData]
  );

  const toggle = (key: NotifKey) => (v: boolean) =>
    setNotifs((prev) => ({ ...prev, [key]: v }));

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          router.replace('/onboarding/splash' as any);
        },
      },
    ]);
  };

  const handleResetOnboarding = () => {
    useOnboardingStore.persist.clearStorage();
    useOnboardingStore.setState({ hasSeenOnboarding: false, intent: 'buy', location: '' });
    router.replace('/onboarding/splash' as any);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'All your data will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Account */}
        <SectionTitle title="Account" />
        <View className="bg-white rounded-2xl mx-5" style={CARD_SHADOW}>
          {accountFields.map((f) => (
            <AccountRow key={f.id} field={f} onPress={() => setEditingField(f)} />
          ))}
          <GuardedTouchableOpacity
            className="flex-row items-center px-4 py-3.5"
            activeOpacity={0.7}
            onPress={() => setShowPasswordModal(true)}
          >
            <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">Password</Text>
              <Text className="text-gray-900 font-medium text-sm mt-0.5">••••••••</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </GuardedTouchableOpacity>
        </View>

        {/* Notifications */}
        <SectionTitle title="Notifications" />
        <View className="bg-white rounded-2xl mx-5" style={CARD_SHADOW}>
          <ToggleRow
            label="Messages"
            sub="Buyer and seller chats"
            value={notifs.messages}
            onChange={toggle('messages')}
          />
          <ToggleRow
            label="Offers & bids"
            sub="When someone makes an offer on your listing"
            value={notifs.offers}
            onChange={toggle('offers')}
          />
          <ToggleRow
            label="Promotions"
            sub="Sales, deals, and platform news"
            value={notifs.promos}
            onChange={toggle('promos')}
          />
          <ToggleRow
            label="Recycle reminders"
            sub="Tips and pickup reminders"
            value={notifs.recycleReminders}
            onChange={toggle('recycleReminders')}
          />
        </View>

        {/* Preferences */}
        <SectionTitle title="Preferences" />
        <View className="bg-white rounded-2xl mx-5" style={CARD_SHADOW}>
          <PickerRow
            label="Shoe size system"
            value={SIZE_SYSTEM_LABELS[sizeSystem]}
            onPress={() => setShowSizeSystemModal(true)}
          />
        </View>

        {/* More */}
        <SectionTitle title="More" />
        <View className="bg-white rounded-2xl mx-5" style={CARD_SHADOW}>
          <ActionRow label="Privacy policy" icon="shield-outline" />
          <ActionRow label="Terms of service" icon="document-text-outline" />
          <ActionRow label="Help & support" icon="help-circle-outline" />
          <ActionRow label="About Resole" icon="information-circle-outline" />
        </View>

        {/* Danger zone */}
        <SectionTitle title="Account actions" />
        <View className="bg-white rounded-2xl mx-5" style={CARD_SHADOW}>
          <ActionRow
            label="Log out"
            icon="log-out-outline"
            color="#F59E0B"
            onPress={handleLogout}
          />
          <ActionRow
            label="Reset Onboarding (Dev)"
            icon="refresh-outline"
            color="#8B5CF6"
            onPress={handleResetOnboarding}
          />
          <ActionRow
            label="Delete account"
            icon="trash-outline"
            color="#EF4444"
            onPress={handleDeleteAccount}
          />
        </View>

        <Text className="text-center text-gray-300 text-xs mt-6">Resole v1.0.0</Text>
      </ScrollView>

      <SizeSystemModal
        visible={showSizeSystemModal}
        current={sizeSystem}
        onSelect={handleSizeSystemChange}
        onClose={() => setShowSizeSystemModal(false)}
      />

      <EditFieldModal
        visible={!!editingField}
        field={editingField}
        onClose={() => setEditingField(null)}
        onSave={handleSaveField}
      />

      <PasswordEditModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handleChangePassword}
      />
    </View>
  );
}
