// services/supabase.ts — Supabase istemci yapılandırması
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

export const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL
  ?? process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? '';

const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? '';

if (!SUPABASE_URL || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Copy .env.example to .env and fill in your values.',
  );
}

if (__DEV__) {
  console.log('[Supabase] URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : '(empty)');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);

// Fiziksel cihazda arka plan/ön plan geçişlerinde oturum yenilemeyi yönet
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
