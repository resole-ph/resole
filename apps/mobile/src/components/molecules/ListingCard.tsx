import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; 

export interface Listing {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair'; 
  imageUrl: string;
  aiScore: number;
  badgeType?: 'Swap' | 'Sale' | 'Hot' | 'Flash Deal';
  description?: string;
  size?: string;
  sold?: string;
  freeShipping?: boolean;
  seller: {
    name: string;
    rating: number;
    avatarUrl?: string;
    totalSales?: number;               
    verified?: boolean;                
    avatarColor?: string;              
  };
}

interface ListingCardProps {
  listing: Listing;
  onSave?: (listing: Listing) => void;
}

const BADGE_STYLES: Record<
  NonNullable<Exclude<Listing['badgeType'], 'Hot'>>,
  { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Swap: { bg: '#2563EB', text: '#fff', icon: 'swap-horizontal' },
  Sale: { bg: '#10B981', text: '#fff', icon: 'pricetag' },
  'Flash Deal': { bg: '#F59E0B', text: '#fff', icon: 'flash' },
};

const CONDITION_COLORS: Record<Listing['condition'], string> = {
  'New':      '#10B981',
  'Like New': '#3B82F6',
  'Good':     '#F59E0B',
  'Fair':     '#9CA3AF',
};

export default function ListingCard({ listing, onSave }: ListingCardProps) {
  // Only handle Swap and Sale on the browse card, fallback gracefully if Hot is passed
  const badge = listing.badgeType && listing.badgeType !== 'Hot' ? BADGE_STYLES[listing.badgeType] : null;
  const conditionColor = CONDITION_COLORS[listing.condition];

  const handlePress = () => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id },
    });
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden flex-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
      activeOpacity={0.92}
      onPress={handlePress}
    >
      {/* Image area */}
      <View className="relative">
        <Image
          source={{ uri: listing.imageUrl }}
          className="w-full"
          style={{ height: 148, backgroundColor: '#F3F4F6' }}
          resizeMode="cover"
        />

        {/* AI Score badge */}
        <View
          className="absolute top-2 left-2 flex-row items-center rounded-full px-2 py-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Ionicons name="sparkles" size={10} color="#FCD34D" />
          <Text className="text-white text-xs font-semibold ml-1">
            {listing.aiScore}% 
          </Text>
        </View>

        {/* Type badge */}
        {badge && (
          <View
            className="absolute top-2 right-2 flex-row items-center rounded-full px-2 py-1"
            style={{ backgroundColor: badge.bg }}
          >
            <Ionicons name={badge.icon} size={10} color={badge.text} />
            <Text style={{ color: badge.text }} className="text-xs font-semibold ml-1">
              {listing.badgeType}
            </Text>
          </View>
        )}

        {/* Free shipping badge */}
        {listing.freeShipping && (
          <View
            className="absolute bottom-2 left-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#D1FAE5' }}
          >
            <Text style={{ color: '#059669', fontSize: 9, fontWeight: '600' }}>Free Ship</Text>
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white items-center justify-center"
          style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 }}
          onPress={() => onSave?.(listing)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Info area */}
      <View className="p-3">
        {/* Brand + condition */}
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-xs text-gray-400 font-medium">{listing.brand}</Text>
          <View className="flex-row items-center">
            <View
              className="w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: conditionColor }}
            />
            <Text className="text-xs" style={{ color: conditionColor }}>
              {listing.condition}
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text className="text-gray-900 font-semibold text-sm leading-tight mb-2" numberOfLines={2}>
          {listing.name}
        </Text>

        {/* Price */}
        <View className="flex-row items-center mb-2">
          <Text className="text-blue-600 font-bold text-base">
            ₱{listing.price.toLocaleString()}
          </Text>
          {listing.originalPrice && (
            <Text className="text-gray-400 text-xs line-through ml-2">
              ₱{listing.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Seller snippet */}
        <View className="flex-row items-center pt-2 border-t border-gray-100">
          <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-1.5">
            <Text className="text-blue-600 text-xs font-bold">
              {listing.seller.name[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
            {listing.seller.name}
          </Text>
          <View className="flex-row items-center">
            {listing.sold ? (
              <Text className="text-gray-400 text-xs">Sold {listing.sold}</Text>
            ) : (
              <>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text className="text-gray-500 text-xs ml-0.5">
                  {listing.seller.rating.toFixed(1)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}