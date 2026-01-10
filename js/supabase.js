import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://rgthabuxucbhlklzlwky.supabase.co";   // ✅ FIXED
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndGhhYnV4dWNiaGxrbHpsa3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDIzODMsImV4cCI6MjA4MzM3ODM4M30.uOZ7Oabk5PSBn0fszhVrzUIBs7l5LyukBdVD1eX497U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

window.supabaseClient = supabase;
console.log("✅ Supabase client initialized");
