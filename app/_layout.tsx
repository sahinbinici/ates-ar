// app/_layout.tsx — Kök layout — Supabase Auth + React Query + i18n sağlayıcılar
import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import '../i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 dakika
    },
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { parent, loadProfile, loadChildren } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadProfile();
          await loadChildren();
        }
        setInitialized(true);
      },
    );
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!parent && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (parent && inAuthGroup) {
      router.replace('/(parent)/dashboard');
    }
  }, [parent, segments, initialized, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGate />
    </QueryClientProvider>
  );
}
