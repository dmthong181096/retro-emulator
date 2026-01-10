import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
// TODO: Replace with your actual Supabase config
const supabaseUrl = 'https://hjhhmlybijayowlcvvbw.supabase.co';
const supabaseAnonKey = 'sb_publishable_VUkdtPBj03Smfi6TcZo2mQ_DqC4kAdN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
console.log('🚀 Supabase initialized:', {
  url: supabaseUrl,
  ready: !!supabase
});

export default supabase;