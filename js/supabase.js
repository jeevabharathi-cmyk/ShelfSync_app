/**
 * Supabase Configuration for ShelfSync
 * Replaces Firebase Authentication and Firestore
 */

// Supabase Configuration - Replace with your actual values
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabaseClient = supabase;

console.log('Supabase client initialized');