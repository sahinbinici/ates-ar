// app/(parent)/_layout.tsx — Ebeveyn paneli layout
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Ateş AR', headerShown: true }} />
      <Stack.Screen name="child/[id]" options={{ title: 'Çocuk Detayı' }} />
      <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
    </Stack>
  );
}
