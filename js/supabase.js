import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://rgthabuxucbhlklzlwky.supabase.co";   // ✅ FIXED
const SUPABASE_ANON_KEY = "YOUR_REAL_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

window.supabaseClient = supabase;
console.log("✅ Supabase client initialized");
