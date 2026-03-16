// app/(child)/_layout.tsx — Çocuk arayüzü layout
import { Stack } from 'expo-router';

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFF3E0' },
      }}
    />
  );
}
