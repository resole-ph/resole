import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const BLUE = '#2563EB';

type TabId = 'home' | 'market' | 'rewards' | 'profile';

interface TabConfig {
  id: TabId;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { id: 'home',    label: 'Home',          route: '/',        icon: 'home-outline',          activeIcon: 'home' },
  { id: 'market',  label: 'Market',  route: '/market',  icon: 'storefront-outline', activeIcon: 'storefront' },
  { id: 'rewards', label: 'Rewards', route: '/rewards', icon: 'gift-outline',        activeIcon: 'gift' },
  { id: 'profile', label: 'Profile',       route: '/profile', icon: 'person-outline',        activeIcon: 'person' },
];

interface BottomNavProps {
  activeTab?: TabId;
  onTabPress?: (tabId: TabId) => void;
  onFabPress?: () => void;
}

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
      className="flex-1 items-center justify-center py-2.5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isActive ? tab.activeIcon : tab.icon}
        size={22}
        color={isActive ? BLUE : '#9CA3AF'}
      />
      <Text
        className="text-xs mt-1"
        style={{ color: isActive ? BLUE : '#9CA3AF', fontWeight: isActive ? '700' : '400' }}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeTab: customActiveTab, onTabPress, onFabPress }: BottomNavProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const insets   = useSafeAreaInsets();

  const activeTab = customActiveTab || pathnameToTab(pathname);

  const handleTabPress = (tab: TabConfig) => {
    if (onTabPress) {
      onTabPress(tab.id);
    } else {
      router.replace(tab.route as any);
    }
  };

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.04)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 12,
      }}
    >
      <View className="flex-row">
        <NavTab tab={TABS[0]} isActive={activeTab === 'home'}    onPress={() => handleTabPress(TABS[0])} />
        <NavTab tab={TABS[1]} isActive={activeTab === 'market'}  onPress={() => handleTabPress(TABS[1])} />

        {/* Centre FAB */}
        <View className="flex-1 items-center justify-center" style={{ marginTop: -26 }}>
          <TouchableOpacity
            onPress={onFabPress}
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: BLUE,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: BLUE,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 10,
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <NavTab tab={TABS[2]} isActive={activeTab === 'rewards'} onPress={() => handleTabPress(TABS[2])} />
        <NavTab tab={TABS[3]} isActive={activeTab === 'profile'} onPress={() => handleTabPress(TABS[3])} />
      </View>
    </View>
  );
}
