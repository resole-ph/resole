import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type TabId = 'home' | 'market' | 'rewards' | 'profile';

interface TabConfig {
  id: TabId;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { id: 'home',    label: 'Home',    route: '/',         icon: 'home-outline',        activeIcon: 'home' },
  { id: 'market',  label: 'Market',  route: '/market',   icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { id: 'rewards', label: 'Rewards', route: '/rewards',  icon: 'gift-outline',        activeIcon: 'gift' },
  { id: 'profile', label: 'Profile', route: '/profile',  icon: 'person-outline',      activeIcon: 'person' },
];

function pathnameToTab(pathname: string): TabId {
  if (pathname.startsWith('/market'))  return 'market';
  if (pathname.startsWith('/rewards')) return 'rewards';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home';
}

function NavTab({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 items-center justify-center py-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isActive ? tab.activeIcon : tab.icon}
        size={24}
        color={isActive ? '#2563EB' : '#9CA3AF'}
      />
      <Text
        className={`text-xs mt-1 ${
          isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'
        }`}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const insets   = useSafeAreaInsets();
  const activeTab = pathnameToTab(pathname);

  return (
    <View
      className="flex-row bg-white border-t border-gray-100"
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <NavTab
        tab={TABS[0]}
        isActive={activeTab === 'home'}
        onPress={() => router.replace('/')}
      />
      <NavTab
        tab={TABS[1]}
        isActive={activeTab === 'market'}
        onPress={() => router.replace('/market')}
      />

      {/* Centre FAB */}
      <View className="flex-1 items-center justify-center" style={{ marginTop: -26 }}>
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center"
          activeOpacity={0.85}
          style={{
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <NavTab
        tab={TABS[2]}
        isActive={activeTab === 'rewards'}
        onPress={() => router.replace('/rewards')}
      />
      <NavTab
        tab={TABS[3]}
        isActive={activeTab === 'profile'}
        onPress={() => router.replace('/profile')}
      />
    </View>
  );
}
