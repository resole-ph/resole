import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export interface Brand {
  id: string;
  label: string;
}