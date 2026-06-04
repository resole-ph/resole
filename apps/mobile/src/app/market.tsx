import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '@/components/organisms/BottomNav';

const BLUE = '#2563EB';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
};

type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  sold: string;
  size: string;
  badge: 'Mall' | 'Flash Deal';
  freeShipping: boolean;
  bgColor: string;
};

const PRODUCTS: Product[] = [
  { id: '1', brand: 'Nike', name: "Air Force 1 '07 White", price: 4800, originalPrice: 6200, sold: '1.2k', size: 'US 9', badge: 'Mall', freeShipping: true, bgColor: '#EEF2FF' },
  { id: '2', brand: 'Adidas', name: 'Ultraboost 22 Core Black', price: 7200, originalPrice: 9500, sold: '890', size: 'US 10', badge: 'Flash Deal', freeShipping: true, bgColor: '#FFF1F0' },
  { id: '3', brand: 'New Balance', name: '574 Classic Grey', price: 3900, originalPrice: 5400, sold: '2.1k', size: 'US 8', badge: 'Mall', freeShipping: false, bgColor: '#F0FDF4' },
  { id: '4', brand: 'Jordan', name: '1 Retro High OG Chicago', price: 18500, originalPrice: 22000, sold: '456', size: 'US 10.5', badge: 'Flash Deal', freeShipping: true, bgColor: '#FFF7ED' },
  { id: '5', brand: 'Puma', name: 'RS-X Reinvention White', price: 3400, originalPrice: 4800, sold: '3.4k', size: 'US 9', badge: 'Mall', freeShipping: true, bgColor: '#F5F3FF' },
  { id: '6', brand: 'Converse', name: 'Chuck 70 Hi Black', price: 3200, originalPrice: 4200, sold: '5.7k', size: 'US 8.5', badge: 'Mall', freeShipping: false, bgColor: '#FAFAF0' },
];

const CATEGORIES = ['All', 'Running', 'Lifestyle', 'Basketball', 'Training', 'Sandals'];

function ProductCard({ product }: { product: Product }) {
  return (
    <View className="flex-1 mx-1.5 mb-3 rounded-2xl bg-white" style={CARD_SHADOW}>
      <TouchableOpacity activeOpacity={0.87} style={{ borderRadius: 20, overflow: 'hidden' }}>
        {/* Image area */}
        <View
          style={{
            height: 152,
            backgroundColor: product.bgColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}
          className="items-center justify-center"
        >
          <Text style={{ fontSize: 60 }}>👟</Text>

          {/* Badge — top left */}
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <View
              className="flex-row items-center rounded-full px-2 py-0.5"
              style={{ backgroundColor: product.badge === 'Flash Deal' ? BLUE : '#111827' }}
            >
              {product.badge === 'Flash Deal' && (
                <Ionicons name="flash" size={9} color="#fff" style={{ marginRight: 2 }} />
              )}
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.2 }}>
                {product.badge === 'Flash Deal' ? 'Flash' : 'Mall'}
              </Text>
            </View>
          </View>

          {/* Free shipping badge — top right */}
          {product.freeShipping && (
            <View
              style={{
                position: 'absolute', top: 8, right: 8,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2,
                borderWidth: 1, borderColor: '#D1FAE5',
              }}
            >
              <Text style={{ color: '#059669', fontSize: 9, fontWeight: '600' }}>Free Ship</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 }}>
          <Text
            style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' }}
            numberOfLines={1}
          >
            {product.brand}
          </Text>
          <Text
            style={{ color: '#1F2937', fontWeight: '600', fontSize: 12.5, lineHeight: 17, marginTop: 2 }}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <Text style={{ color: BLUE, fontWeight: '800', fontSize: 15.5, marginTop: 8 }}>
            ₱{product.price.toLocaleString()}
          </Text>
          <Text style={{ color: '#D1D5DB', fontSize: 10, textDecorationLine: 'line-through', marginTop: 1 }}>
            ₱{product.originalPrice.toLocaleString()}
          </Text>

          <View className="flex-row items-center justify-between" style={{ marginTop: 8 }}>
            <Text style={{ color: '#D1D5DB', fontSize: 10 }}>Sold {product.sold}</Text>
            <Text style={{ color: '#D1D5DB', fontSize: 10 }}>{product.size}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function MarketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');
  const [countdown, setCountdown] = useState({ h: 3, m: 45, s: 22 });

  useEffect(() => {
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
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View className="flex-1 bg-slate-50">

      {/* ── Fixed header ─────────────────────────────── */}
      <View className="bg-white" style={{ paddingTop: insets.top }}>

        {/* Title row */}
        <View className="flex-row items-center px-4 pt-3 pb-2.5">
          <View className="flex-row items-center flex-1">
            <Text style={{ color: BLUE, fontWeight: '800', fontSize: 19, letterSpacing: -0.5 }}>
              Resole
            </Text>
          </View>

          {/* Notification icon */}
          <TouchableOpacity style={{ marginRight: 16 }} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#374151" />
            <View
              style={{
                position: 'absolute', top: -3, right: -4,
                backgroundColor: BLUE, borderRadius: 8,
                width: 14, height: 14, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>2</Text>
            </View>
          </TouchableOpacity>

          {/* Cart icon */}
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={23} color="#374151" />
            <View
              style={{
                position: 'absolute', top: -3, right: -5,
                backgroundColor: BLUE, borderRadius: 8,
                width: 14, height: 14, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <View
            className="flex-row items-center rounded-xl px-3.5 py-2.5"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Ionicons name="search-outline" size={15} color="#9CA3AF" />
            <TextInput
              placeholder="Search sneakers, brands..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, marginLeft: 8, fontSize: 13.5, color: '#374151' }}
              editable={false}
            />
            <View style={{ width: 1, height: 14, backgroundColor: '#E5E7EB' }} />
            <Text style={{ color: BLUE, fontSize: 12, fontWeight: '700', marginLeft: 10 }}>Search</Text>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        >
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: isActive ? BLUE : '#F3F4F6',
                  borderRadius: 99,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  marginRight: idx < CATEGORIES.length - 1 ? 8 : 0,
                }}
                activeOpacity={0.75}
              >
                <Text style={{ color: isActive ? '#fff' : '#6B7280', fontSize: 12.5, fontWeight: isActive ? '700' : '500' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable content ───────────────────────── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
      >

        {/* Sort / filter bar */}
        <View className="flex-row items-center px-4 mb-4">
          <Text style={{ color: '#9CA3AF', fontSize: 12.5, flex: 1 }}>
            <Text style={{ color: '#374151', fontWeight: '600' }}>126</Text> products found
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-3 py-1.5"
            style={{ backgroundColor: '#fff', ...CARD_SHADOW, marginRight: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={13} color={BLUE} />
            <Text style={{ color: BLUE, fontSize: 11.5, fontWeight: '600', marginLeft: 4 }}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-3 py-1.5"
            style={{ backgroundColor: '#fff', ...CARD_SHADOW }}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical-outline" size={13} color="#6B7280" />
            <Text style={{ color: '#6B7280', fontSize: 11.5, fontWeight: '600', marginLeft: 4 }}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Flash Sale header with countdown */}
        <View className="flex-row items-center px-4 mb-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="flash" size={15} color={BLUE} />
            <Text style={{ color: BLUE, fontWeight: '800', fontSize: 14.5, marginLeft: 4 }}>Flash Sale</Text>

            {/* Countdown pills */}
            <View className="flex-row items-center ml-3">
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((unit, i) => (
                <View key={i} className="flex-row items-center">
                  <View style={{ backgroundColor: BLUE, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{unit}</Text>
                  </View>
                  {i < 2 && (
                    <Text style={{ color: BLUE, fontWeight: '800', fontSize: 11, marginHorizontal: 3 }}>:</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity className="flex-row items-center" activeOpacity={0.7}>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>See all</Text>
            <Ionicons name="chevron-forward" size={13} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 2-column product grid */}
        <View style={{ paddingHorizontal: 10 }}>
          <View className="flex-row">
            <ProductCard product={PRODUCTS[0]} />
            <ProductCard product={PRODUCTS[1]} />
          </View>
          <View className="flex-row">
            <ProductCard product={PRODUCTS[2]} />
            <ProductCard product={PRODUCTS[3]} />
          </View>
          <View className="flex-row">
            <ProductCard product={PRODUCTS[4]} />
            <ProductCard product={PRODUCTS[5]} />
          </View>
        </View>

        {/* ── Voucher / Free Shipping Banner ──────────── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 8,
            borderRadius: 24,
            backgroundColor: BLUE,
            overflow: 'hidden',
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.38,
            shadowRadius: 14,
            elevation: 8,
          }}
        >
          {/* Decorative circles */}
          <View style={{ position: 'absolute', top: -28, right: -18, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ position: 'absolute', bottom: -22, right: 55, width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View style={{ position: 'absolute', top: 10, right: 90, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)' }} />

          <View className="flex-row items-center p-5">
            {/* Text block */}
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>LIMITED OFFER</Text>
              </View>

              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, lineHeight: 25 }}>
                Claim your Free{'\n'}Shipping Voucher
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 5, lineHeight: 17 }}>
                Valid for Metro Manila deliveries
              </Text>

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-start', marginTop: 14,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8,
                }}
                activeOpacity={0.75}
              >
                <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>Claim Now →</Text>
              </TouchableOpacity>
            </View>

            {/* Delivery icon circle */}
            <View
              style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center', justifyContent: 'center',
                marginLeft: 14,
              }}
            >
              <Ionicons name="car-outline" size={34} color="rgba(255,255,255,0.95)" />
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav activeTab="market" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
