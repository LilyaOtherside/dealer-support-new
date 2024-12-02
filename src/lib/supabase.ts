import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Checking Supabase config:', {
  url: supabaseUrl,
  keyExists: !!supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing connection to:', supabaseUrl);
    const { data, error } = await supabase
      .from('telegram_users')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    console.log('Connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
}; 