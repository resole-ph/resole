import { create } from 'zustand';

export type NotifCategory = 'order' | 'offer' | 'listing' | 'reward' | 'system';

export type Notification = {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  timeLabel: string;
  timestamp: number;
  read: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
};

const NOW = Date.now();
const mins = (n: number) => NOW - 1000 * 60 * n;
const hrs = (n: number) => NOW - 1000 * 60 * 60 * n;

const MOCK: Notification[] = [
  {
    id: 'n1',
    category: 'order',
    title: 'Order out for delivery',
    body: 'ORD-001 (Nike Air Max 90) is expected by 3 PM today.',
    timeLabel: '9:41 AM',
    timestamp: mins(19),
    read: false,
    icon: 'cube-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'n2',
    category: 'offer',
    title: 'New swap offer from @JanGPT',
    body: 'Air Globe Runner for your Panda Dunk — both DS.',
    timeLabel: '8:15 AM',
    timestamp: mins(90),
    read: false,
    icon: 'swap-horizontal-outline',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
  },
  {
    id: 'n3',
    category: 'listing',
    title: 'Your listing is trending',
    body: '"Adidas Samba OG" was viewed 48 times this week.',
    timeLabel: 'Yesterday',
    timestamp: hrs(26),
    read: false,
    icon: 'bar-chart-outline',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
  },
  {
    id: 'n4',
    category: 'reward',
    title: 'You earned 80 Recycle Coins',
    body: 'Thanks for donating your Converse Chuck 70 to Gawad Kalinga.',
    timeLabel: 'Yesterday',
    timestamp: hrs(30),
    read: true,
    icon: 'leaf-outline',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
  },
  {
    id: 'n5',
    category: 'system',
    title: 'Flash Sale starts in 1 hour',
    body: 'Up to 40% off on selected Nike and Adidas pairs.',
    timeLabel: 'Mon',
    timestamp: hrs(48),
    read: true,
    icon: 'flash-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
  },
  {
    id: 'n6',
    category: 'offer',
    title: '@kevinr accepted your swap offer',
    body: 'Your NB 550 for his Panda Dunk — swap confirmed!',
    timeLabel: 'Mon',
    timestamp: hrs(52),
    read: true,
    icon: 'checkmark-circle-outline',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
  },
  {
    id: 'n7',
    category: 'system',
    title: 'Profile verified',
    body: 'Your Resole seller badge is now active.',
    timeLabel: 'May 22',
    timestamp: hrs(72),
    read: true,
    icon: 'shield-checkmark-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
];

interface NotificationsState {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: MOCK,

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
