/**
 * Supabase Configuration for ShelfSync
 * Provides authentication and database functionality
 */

// Supabase Configuration - Replace with your actual values
const SUPABASE_URL = "https://rgthabuxucbhlklzlkwy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Do7m3lApXdkWb7MiX_CsIg_BWBsCXOB";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabaseClient = supabase;

console.log('Supabase client initialized');