import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Check if config is valid
const isValidConfig = supabaseUrl && supabaseUrl.includes('supabase.co') && 
                     supabaseAnonKey && supabaseAnonKey.length > 20;

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
    
  } catch (error) {
    // Supabase initialization failed
  }
} else {
  // Invalid Supabase configuration - using mock mode
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