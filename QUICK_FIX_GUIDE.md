# 🚀 QUICK SETUP: Supabase Configuration Guide

## THE SETUP
Your ShelfSync application is now running on Supabase!
Follow these steps to complete the setup process.

---

## THE SETUP (2 STEPS - 10 MINUTES)

### STEP 1: Create Supabase Project ⚡

**DO THIS FIRST - IT'S REQUIRED!**

1. **Go to Supabase:**
   ```
   https://supabase.com
   ```

2. **Create a new project:**
   - Click **"New Project"**
   - Choose your organization
   - Enter project name: **"ShelfSync"**
   - Enter database password (save this!)
   - Select region closest to you
   - Click **"Create new project"**

3. **Wait 2-3 minutes** for project creation

4. **Get your credentials:**
   - Go to **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

---

### STEP 2: Update Configuration 👤

**After Step 1 is complete:**

1. **Edit your configuration file:**
   ```
   js/supabase.js
   ```

2. **Replace the placeholder values:**
   ```javascript
   const SUPABASE_URL = "YOUR_PROJECT_URL_HERE";
   const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";
   ```

3. **Run the database setup:**
   - Go to your Supabase project dashboard
   - Click **SQL Editor**
   - Copy and paste the SQL from `SUPABASE_MIGRATION_GUIDE.md`
   - Click **Run**

---

## YOUR TEST CREDENTIALS

After setup is complete, you can create a test account or use these if available:

```
Email:    test@example.com
Password: TestPassword123
Role:     Seller
```

---

## VERIFY IT WORKED

1. Go to your Seller Login page
2. Try signing up with a new account
3. Check that you can login
4. You should be redirected to the appropriate dashboard

If you see connection errors, check that your Supabase configuration is correct.

---

## COMMON SETUP ISSUES & FIXES

### "Supabase not configured"
→ **Check js/supabase.js** - Make sure you updated the URL and key

### "Invalid API key"
→ **Wrong key copied.** Go to Supabase Settings → API → Copy the **anon public** key (not service role)

### "Database connection failed"
→ **Tables not created.** Run the SQL setup from the migration guide

### "Permission denied"
→ **RLS policies missing.** Make sure you ran all the SQL commands including the policies

### Still not working?
→ **Check Supabase Dashboard:** Go to your project → Authentication → Users
   - Try creating a user through the dashboard first
   - Check that tables exist in Database → Tables

---

## FILES TO REFERENCE

1. **SUPABASE_MIGRATION_GUIDE.md** ← Complete setup instructions
2. **MIGRATION_SUMMARY.md** ← What was changed
3. **js/supabase.js** ← Configuration file to update

---

## SUMMARY

✅ Step 1: Create Supabase project and get credentials
✅ Step 2: Update js/supabase.js with your credentials  
✅ Step 3: Run SQL setup commands in Supabase dashboard
✅ Step 4: Test signup/login functionality
✅ Done!

---

Last Updated: 2026-01-08
