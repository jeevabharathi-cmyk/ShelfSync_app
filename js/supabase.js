/**
 * Supabase Configuration for ShelfSync
 * Provides authentication and database functionality
 */

// Supabase Configuration - Replace with your actual values
const SUPABASE_URL = "https://rgthabuxcblhklzlkwy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndGhhYnV4dWNiaGxrbHpsa3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDIzODMsImV4cCI6MjA4MzM3ODM4M30.uOZ7Oabk5PSBn0fszhVrzUIBs7l5LyukBdVD1eX497U";

// Initialize Supabase client only if not already initialized
if (!window.supabaseClient) {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        },
        global: {
            headers: {
                "X-Client-Info": "shelfsync-github-pages"
            }
        }
    });
    
    window.supabaseClient = supabase;
    
    // Force JWT on every request - Critical for RLS
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            supabase.rest.setAuth(session.access_token);
        }
    });
    
    console.log('Supabase client initialized');
} else {
    console.log('Supabase client already exists');
}