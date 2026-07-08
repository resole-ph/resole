import { Ionicons } from '@expo/vector-icons';

export type MsgTab = 'all' | 'offers' | 'updates';


export type Message = {
  id: string;
  tab: MsgTab;
  sender: string;
  avatarColor?: string;
  avatarInitial: string;
  preview: string;
  time: string;
  unread: number;
  icon?: keyof typeof Ionicons.glyphMap;
  isSystem: boolean;
};