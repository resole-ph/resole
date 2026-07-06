import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { authService } from '@/features/auth/services/auth.service';
import { useOnboardingStore } from '@/store/onboarding';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type NotifKey = 'messages' | 'offers' | 'promos' | 'recycleReminders';

const ACCOUNT_FIELDS = [
  { id: 'name',     label: 'Full name', value: '', icon: 'person-outline' as const },
  { id: 'email',    label: 'Email',     value: '', icon: 'mail-outline' as const },
  { id: 'phone',    label: 'Phone',     value: '', icon: 'call-outline' as const },
  { id: 'location', label: 'Location',  value: '', icon: 'location-outline' as const },
];

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide px-5 mt-5 mb-2">
      {title}
    </Text>
  );
}

function AccountRow({ field }: { field: (typeof ACCOUNT_FIELDS)[number] }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={field.icon} size={16} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-400 text-xs">{field.label}</Text>
        <Text className="text-gray-900 font-medium text-sm mt-0.5">{field.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
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
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icon} size={18} color={color} style={{ marginRight: 12 }} />
      <Text className="flex-1 font-medium text-sm" style={{ color }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
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
          router.replace('/onboarding/auth' as any);
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
          {ACCOUNT_FIELDS.map((f) => (
            <AccountRow key={f.id} field={f} />
          ))}
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5"
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">Password</Text>
              <Text className="text-gray-900 font-medium text-sm mt-0.5">••••••••</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
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
    </View>
  );
}
