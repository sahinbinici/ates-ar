// app.config.js — Expo config with env var mapping for production builds

export default ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    eas: {
      projectId: config.extra?.eas?.projectId,
    },
  },
});
