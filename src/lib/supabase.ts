import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables! Please create a .env file with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // On web, magic link redirects append tokens to the URL hash — we need to detect them.
      // On native, deep links are handled separately, so keep this false.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

/** Returns true if Supabase is properly configured with real credentials */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey !== 'placeholder'
  );
};
