import { Stack } from 'expo-router';

export default function SellLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: false,
      }}
    />
  );
}
