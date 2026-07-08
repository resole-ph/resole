import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListingCard, { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';
import { UserService } from '@/features/user/services/user.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
};

interface BrowseFeedProps {
  title?: string;
  subtitle?: string;
  listings?: Listing[];
  showFlashSale?: boolean;
  showFilters?: boolean;
  totalCount?: number;
  onFilter?: () => void;
  onSort?: () => void;
  onViewAll?: () => void;
  onSaveListing?: (listing: Listing) => void;
}

export default function BrowseFeed({
  title = 'Listings',
  subtitle = 'Kickstart your day',
  showFlashSale = false,
  showFilters = false,
  totalCount,
  onFilter,
  onSort,
  onViewAll,
  onSaveListing,
}: BrowseFeedProps) {
  const [countdown, setCountdown] = useState({ h: 3, m: 45, s: 22 });
  const [listings, setListings] = useState<Listing[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!showFlashSale) return;
    const t = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showFlashSale]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await ListingService.getListings();
        setListings(Array.isArray(data) ? data : []);
      } catch {
        setListings([]);
      }
    }

    fetchListings();

    UserService.getUserInfo()
      .then((user) => setCurrentUserId(user.id))
      .catch((error) => console.error('Failed to load current user:', error));
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View className="mb-6">
      {/* Section header */}
      {showFlashSale ? (
        <View className="flex-row items-center px-5 mb-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="flash" size={15} color="#2563EB" />
            <Text style={{ color: '#2563EB', fontWeight: '800', fontSize: 14.5, marginLeft: 4 }}>
              {title}
            </Text>
            <View className="flex-row items-center ml-3">
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((unit, i) => (
                <View key={i} className="flex-row items-center">
                  <View style={{ backgroundColor: '#2563EB', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{unit}</Text>
                  </View>
                  {i < 2 && (
                    <Text style={{ color: '#2563EB', fontWeight: '800', fontSize: 11, marginHorizontal: 3 }}>:</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} className="flex-row items-center">
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>See all</Text>
            <Ionicons name="chevron-forward" size={13} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center justify-between px-5 mb-3">
          <View>
            <Text className="text-gray-900 font-bold text-base">{title}</Text>
            {subtitle ? <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text> : null}
          </View>
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text className="text-blue-600 text-sm font-medium">View all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter / sort bar */}
      {showFilters && (
        <View className="flex-row items-center px-5 mb-3">
          <Text style={{ color: '#9CA3AF', fontSize: 12.5, flex: 1 }}>
            {totalCount != null
              ? <><Text style={{ color: '#374151', fontWeight: '600' }}>{totalCount}</Text>{' products found'}</>
              : null}
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-3 py-1.5 bg-white mr-2"
            style={CARD_SHADOW}
            onPress={onFilter}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={13} color="#2563EB" />
            <Text style={{ color: '#2563EB', fontSize: 11.5, fontWeight: '600', marginLeft: 4 }}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-3 py-1.5 bg-white"
            style={CARD_SHADOW}
            onPress={onSort}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical-outline" size={13} color="#6B7280" />
            <Text style={{ color: '#6B7280', fontSize: 11.5, fontWeight: '600', marginLeft: 4 }}>Sort</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2-column grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 }}>
        {listings.map((listing) => (
          <View key={listing.id} style={{ width: '50%', padding: 5 }}>
            <ListingCard listing={listing} onSave={onSaveListing} currentUserId={currentUserId} />
          </View>
        ))}
      </View>
    </View>
  );
}
