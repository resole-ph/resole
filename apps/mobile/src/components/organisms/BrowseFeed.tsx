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
  /** When provided, the feed renders this list instead of fetching its own. */
  listings?: Listing[];
  /** Only used when `listings` isn't provided (self-fetching mode). */
  brand?: string | null;
  search?: string;
  /** When true, only listings the current user has saved are shown. */
  favoritesOnly?: boolean;
  showFlashSale?: boolean;
  showFilters?: boolean;
  totalCount?: number;
  onFilter?: () => void;
  onSort?: () => void;
  onViewAll?: () => void;
  onSaveListing?: (listing: Listing) => void;
  /** Extra control rendered next to "View all" in the section header. */
  headerRight?: React.ReactNode;
}

export default function BrowseFeed({
  title = 'Listings',
  subtitle = 'Kickstart your day',
  listings: listingsProp,
  brand,
  search,
  favoritesOnly = false,
  showFlashSale = false,
  showFilters = false,
  totalCount,
  onFilter,
  onSort,
  onViewAll,
  onSaveListing,
  headerRight,
}: BrowseFeedProps) {
  const [countdown, setCountdown] = useState({ h: 3, m: 45, s: 22 });
  const [fetchedListings, setFetchedListings] = useState<Listing[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const listings = listingsProp ?? fetchedListings;
  const visibleListings = favoritesOnly
    ? listings.filter((listing) => savedIds.has(listing.id))
    : listings;

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
    // Controlled mode: the parent already fetched `listings`, so skip the self-fetch.
    if (listingsProp) return;

    const fetchListings = async () => {
      try {
        const data = await ListingService.getListings({ brand: brand ?? undefined, search });
        setFetchedListings(Array.isArray(data) ? data : []);
      } catch {
        setFetchedListings([]);
      }
    }

    fetchListings();
  }, [listingsProp, brand, search])

  useEffect(() => {
    UserService.getUserInfo()
      .then((user) => setCurrentUserId(user.id))
      .catch((error) => console.error('Failed to load current user:', error));
  }, [])

  useEffect(() => {
    ListingService.getFavouriteListingIds()
      .then((ids) => setSavedIds(new Set(ids.map(String))))
      .catch((error) => console.error('Failed to load saved listings:', error));
  }, [])

  const handleSave = async (listing: Listing) => {
    const wasSaved = savedIds.has(listing.id);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(listing.id);
      else next.add(listing.id);
      return next;
    });

    try {
      if (wasSaved) {
        await ListingService.unfavouriteListing(Number(listing.id));
      } else {
        await ListingService.favouriteListing(Number(listing.id));
      }
    } catch (error) {
      console.error('Failed to update saved listing:', error);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(listing.id);
        else next.delete(listing.id);
        return next;
      });
    }

    onSaveListing?.(listing);
  };

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
          {headerRight}
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
      {visibleListings.length === 0 ? (
        <View className="items-center py-10">
          <Ionicons
            name={favoritesOnly ? 'heart-outline' : 'search-outline'}
            size={32}
            color="#D1D5DB"
          />
          <Text className="text-gray-400 text-sm mt-2">
            {favoritesOnly ? 'No favorites yet' : 'No listings found'}
          </Text>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 }}>
            {visibleListings.map((listing) => (
              <View key={listing.id} style={{ width: '50%', padding: 5 }}>
                <ListingCard
                  listing={listing}
                  onSave={handleSave}
                  isSaved={savedIds.has(listing.id)}
                  currentUserId={currentUserId}
                />
              </View>
            ))}
          </View>
          {onViewAll && (
            <TouchableOpacity
              onPress={onViewAll}
              activeOpacity={0.7}
              className="flex-row items-center justify-center mt-2 mx-5 py-3 rounded-xl bg-white border border-gray-200"
            >
              <Text className="text-blue-600 text-sm font-medium mr-1">View all</Text>
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
