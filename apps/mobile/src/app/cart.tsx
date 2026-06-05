import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, type CartItem } from '@/store/cart';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

const CONDITION_COLORS: Record<string, string> = {
  New: '#10B981',
  'Like New': '#3B82F6',
  Good: '#F59E0B',
  Fair: '#9CA3AF',
};

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCartStore();
  const conditionColor = CONDITION_COLORS[item.listing.condition] ?? '#9CA3AF';

  return (
    <View className="flex-row bg-white rounded-2xl p-3 mb-3" style={CARD_SHADOW}>
      {/* Image */}
      <Image
        source={{ uri: item.listing.imageUrl }}
        style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#F3F4F6' }}
        resizeMode="cover"
      />

      {/* Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-gray-400 text-xs font-medium">{item.listing.brand}</Text>
            <Text className="text-gray-900 font-semibold text-sm leading-snug mt-0.5" numberOfLines={2}>
              {item.listing.name}
            </Text>
            {item.listing.size && (
              <Text className="text-gray-400 text-xs mt-0.5">Size: {item.listing.size}</Text>
            )}
          </View>
          {/* Remove */}
          <TouchableOpacity
            onPress={() => removeItem(item.listing.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          {/* Price */}
          <Text className="text-blue-600 font-bold text-base">
            ₱{(item.listing.price * item.quantity).toLocaleString()}
          </Text>

          {/* Qty stepper */}
          <View
            className="flex-row items-center rounded-xl overflow-hidden"
            style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
          >
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              style={{ backgroundColor: item.quantity <= 1 ? '#F9FAFB' : '#EFF6FF' }}
              onPress={() => updateQuantity(item.listing.id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                size={14}
                color={item.quantity <= 1 ? '#9CA3AF' : '#2563EB'}
              />
            </TouchableOpacity>
            <View className="w-8 h-8 items-center justify-center bg-white">
              <Text className="text-gray-900 font-semibold text-sm">{item.quantity}</Text>
            </View>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center bg-blue-50"
              onPress={() => updateQuantity(item.listing.id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Condition pill */}
        <View className="flex-row mt-2">
          <View
            className="flex-row items-center rounded-full px-2 py-0.5"
            style={{ backgroundColor: conditionColor + '18' }}
          >
            <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: conditionColor }} />
            <Text className="text-xs font-semibold" style={{ color: conditionColor }}>
              {item.listing.condition}
            </Text>
          </View>
          {item.listing.freeShipping && (
            <View
              className="flex-row items-center rounded-full px-2 py-0.5 ml-2"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <Ionicons name="car-outline" size={10} color="#059669" />
              <Text className="text-xs font-semibold ml-1" style={{ color: '#059669' }}>
                Free Ship
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function EmptyCart() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-5"
      >
        <Ionicons name="cart-outline" size={44} color="#2563EB" />
      </View>
      <Text className="text-gray-900 text-xl font-bold text-center">Your cart is empty</Text>
      <Text className="text-gray-400 text-sm text-center mt-2 leading-relaxed">
        Browse the market and add some kicks to get started.
      </Text>
      <TouchableOpacity
        className="mt-6 bg-blue-600 rounded-2xl px-8 py-3.5"
        onPress={() => router.push('/market')}
        activeOpacity={0.85}
        style={{
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text className="text-white font-bold text-base">Browse Market</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0);
  const hasFreeship = items.some((i) => i.listing.freeShipping);
  const shipping = items.length === 0 ? 0 : hasFreeship ? 0 : 150;
  const total = subtotal + shipping;
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-4 bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-gray-900 font-bold text-lg">My Cart</Text>
          {totalCount > 0 && (
            <Text className="text-gray-400 text-xs">{totalCount} item{totalCount !== 1 ? 's' : ''}</Text>
          )}
        </View>

        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} activeOpacity={0.7}>
            <Text className="text-red-500 text-sm font-medium">Clear</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {items.map((item) => (
              <CartItemRow key={item.listing.id} item={item} />
            ))}

            {/* Order summary card */}
            <View className="bg-white rounded-2xl p-4 mt-2" style={CARD_SHADOW}>
              <Text className="text-gray-900 font-bold text-base mb-4">Order Summary</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-sm">Subtotal</Text>
                <Text className="text-gray-900 font-semibold text-sm">
                  ₱{subtotal.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500 text-sm">Shipping</Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: shipping === 0 ? '#10B981' : '#374151' }}
                >
                  {shipping === 0 ? 'Free' : `₱${shipping}`}
                </Text>
              </View>

              <View className="h-px bg-gray-100 mb-4" />

              <View className="flex-row justify-between">
                <Text className="text-gray-900 font-bold text-base">Total</Text>
                <Text className="text-blue-600 font-bold text-lg">
                  ₱{total.toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout bar */}
          <View
            className="bg-white border-t border-gray-100 px-5 pt-4"
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              className="bg-blue-600 rounded-2xl py-4 items-center flex-row justify-center"
              activeOpacity={0.85}
              style={{
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="bag-check-outline" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Checkout · ₱{total.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
