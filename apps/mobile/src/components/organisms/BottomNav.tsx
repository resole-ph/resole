import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type TabId = 'home' | 'market' | 'rewards' | 'profile';

interface TabConfig {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { id: 'home',    label: 'Home',    icon: 'home-outline',        activeIcon: 'home' },
  { id: 'market',  label: 'Market',  icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { id: 'rewards', label: 'Rewards', icon: 'gift-outline',        activeIcon: 'gift' },
  { id: 'profile', label: 'Profile', icon: 'person-outline',      activeIcon: 'person' },
];

interface BottomNavProps {
  activeTab?: TabId;
  onTabPress?: (tabId: TabId) => void;
}

function NavTab({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress?: (id: TabId) => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 items-center justify-center py-3"
      onPress={() => onPress?.(tab.id)}
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

export default function BottomNav({ activeTab = 'home', onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();

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
      <NavTab tab={TABS[0]} isActive={activeTab === 'home'}    onPress={onTabPress} />
      <NavTab tab={TABS[1]} isActive={activeTab === 'market'}  onPress={onTabPress} />

      {/* Centre FAB — floats above the bar */}
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

      <NavTab tab={TABS[2]} isActive={activeTab === 'rewards'} onPress={onTabPress} />
      <NavTab tab={TABS[3]} isActive={activeTab === 'profile'} onPress={onTabPress} />
    </View>
  );
}
