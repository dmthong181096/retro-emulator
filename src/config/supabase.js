import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Debug logging for deployment
console.log('🔧 Supabase Config Debug:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- URL exists:', !!supabaseUrl);
console.log('- URL preview:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
console.log('- Key exists:', !!supabaseAnonKey);
console.log('- Key preview:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');

// Check if config is valid
const isValidConfig = supabaseUrl && supabaseUrl.includes('supabase.co') && 
                     supabaseAnonKey && supabaseAnonKey.length > 20;

console.log('- Config valid:', isValidConfig);

let supabase = null;

if (isValidConfig) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Supabase client created successfully');
    
    // Test connection
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('⚠️ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
        console.log('- Session exists:', !!data.session);
      }
    }).catch(err => {
      console.log('❌ Supabase connection test error:', err.message);
    });
    
  } catch (error) {
    console.log('❌ Supabase initialization failed:', error.message);
  }
} else {
  console.log('⚠️ Invalid Supabase configuration - using mock mode');
  console.log('- Missing URL:', !supabaseUrl);
  console.log('- Invalid URL format:', supabaseUrl && !supabaseUrl.includes('supabase.co'));
  console.log('- Missing key:', !supabaseAnonKey);
  console.log('- Invalid key length:', supabaseAnonKey && supabaseAnonKey.length <= 20);
}

// Mock Supabase for development when config is invalid
const mockSupabase = {
  auth: {
    signInWithPassword: async () => ({ 
      data: null, 
      error: { message: 'Supabase not configured - using mock login' } 
    }),
    signUp: async () => ({ 
      data: null, 
      error: { message: 'Supabase not configured - using mock register' } 
    }),
    signOut: async () => ({ 
      data: null, 
      error: null 
    }),
    getSession: async () => ({ 
      data: { session: null }, 
      error: null 
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        limit: async () => ({ data: null, error: { message: 'Supabase not configured' } })
      }) 
    }),
    upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    delete: () => ({ 
      eq: () => ({ 
        eq: () => ({ 
          eq: () => ({ 
            eq: async () => ({ data: null, error: { message: 'Supabase not configured' } }) 
          }) 
        }) 
      }) 
    })
  })
};

export const supabaseClient = supabase || mockSupabase;
export { supabaseClient as supabase };
export default supabaseClient;