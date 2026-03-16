// app/index.tsx — Kök yönlendirme (auth durumuna göre)
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const parent = useAuthStore((s) => s.parent);

  if (parent) {
    return <Redirect href="/(parent)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
