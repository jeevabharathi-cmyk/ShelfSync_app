/**
 * Supabase Configuration for ShelfSync
 * Provides authentication and database functionality
 */

// Supabase Configuration - Replace with your actual values
const SUPABASE_URL = "https://rgthabuxucbhlklzlkwy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndGhhYnV4dWNiaGxrbHpsa3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDIzODMsImV4cCI6MjA4MzM3ODM4M30.uOZ7Oabk5PSBn0fszhVrzUIBs7l5LyukBdVD1eX497U";

// Initialize Supabase client only if not already initialized
if (!window.supabaseClient) {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.log('Supabase client initialized');
} else {
    console.log('Supabase client already exists');
}