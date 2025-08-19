import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with enhanced session handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Helper to ensure valid timestamps
const safeTimestamp = (timestamp: string | null | undefined): string => {
  return timestamp || new Date().toISOString();
};

// Handle session persistence with timestamp protection
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Ensure valid timestamps in session
    if (session?.user) {
      session.user = {
        ...session.user,
        created_at: safeTimestamp(session.user.created_at),
        updated_at: safeTimestamp(session.user.updated_at)
      };
    }
    
    try {
      localStorage.setItem('supabase.auth.session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }
  } else if (event === 'SIGNED_OUT') {
    try {
      localStorage.removeItem('supabase.auth.session');
    } catch (e) {
      console.error('Failed to remove session from localStorage:', e);
    }
  }
});

// Initialize from localStorage with timestamp protection
try {
  const savedSession = localStorage.getItem('supabase.auth.session');
  if (savedSession) {
    const sessionData = JSON.parse(savedSession);
    
    // Ensure valid timestamps
    if (sessionData?.user) {
      sessionData.user = {
        ...sessionData.user,
        created_at: safeTimestamp(sessionData.user.created_at),
        updated_at: safeTimestamp(sessionData.user.updated_at)
      };
    }
    
    if (sessionData?.access_token && sessionData?.refresh_token) {
      supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      });
    }
  }
} catch (e) {
  console.error('Failed to initialize session from localStorage:', e);
  localStorage.removeItem('supabase.auth.session');
}