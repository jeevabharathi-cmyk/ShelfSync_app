# 🔥 ShelfSync Firebase Setup Guide

## The Problem

You're seeing this error: **"Failed to get document because the client is offline"**

This means your **Firestore database hasn't been created yet** in Firebase Console.

---

## Quick Fix (3 Simple Steps)

### Method 1: Use the Setup Wizard (RECOMMENDED)

1. **Open the Firebase Setup Wizard:**
   - Open `firebase-setup-wizard.html` in your browser
   - Or navigate to: `http://localhost:3000/firebase-setup-wizard.html`

2. **Follow the wizard steps:**
   - Step 1: Check Firebase connection
   - Step 2: Create Firestore database (if needed)
   - Step 3: Setup your user profile
   - Step 4: Done! You can now login

---

### Method 2: Manual Setup

If you prefer to do it manually:

#### Step 1: Create Firestore Database

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/shelfsync-6fedf/firestore
   ```

2. **Click "Create Database"** button

3. **Choose Options:**
   - **Location:** `nam5 (us-central)` or closest to you
   - **Security Rules:** Select **"Start in test mode"**
   - Click **"Enable"**

4. **Wait 1-2 minutes** for database creation

#### Step 2: Create Your User Profile

After database is created, run this in your browser console:

```javascript
// Go to: pages/login-seller.html
// Open Console (F12)
// Paste this code:

(async function() {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDfyqcchPmY0MvKCaJQmwP0ILyf9UODMis",
        authDomain: "shelfsync-6fedf.firebaseapp.com",
        projectId: "shelfsync-6fedf",
        storageBucket: "shelfsync-6fedf.firebasestorage.app",
        messagingSenderId: "328141524902",
        appId: "1:328141524902:web:5616c7b58d48deda3f0967"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    try {
        // Create user
        const email = 'jackdoe628@gmail.com';
        const password = 'TestPassword123';
        
        console.log('Creating user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ User created! UID:', user.uid);
        
        // Create seller profile
        console.log('Creating seller profile...');
        await setDoc(doc(db, 'sellers', user.uid), {
            email: email,
            role: 'seller',
            storeName: 'My Bookstore',
            verified: true,
            createdAt: new Date().toISOString()
        });
        
        console.log('✅ Seller profile created!');
        alert('Success! You can now login with:\nEmail: ' + email + '\nPassword: ' + password);
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('✅ User already exists! You can login now.');
            alert('User already exists! Try logging in.');
        } else {
            console.error('❌ Error:', error);
            alert('Error: ' + error.message);
        }
    }
})();
```

---

## Firestore Security Rules

Your Firestore should be in **Test Mode** with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 6);
    }
  }
}
```

**Note:** Test mode allows all reads/writes. Change this for production!

---

## Default Test Credentials

After setup, you can login with:

- **Email:** `jackdoe628@gmail.com`
- **Password:** `TestPassword123`
- **Role:** Seller

---

## Troubleshooting

### Error: "client is offline"
→ **Solution:** Firestore database not created. Follow Step 1 above.

### Error: "permission denied"
→ **Solution:** Change Firestore to Test Mode in Console

### Error: "email already in use"
→ **Solution:** Good! User exists. Just try logging in.

### Error: "network-request-failed"
→ **Solution:** Check your internet connection

---

## What Happens After Setup?

1. ✅ Firebase Authentication is active
2. ✅ Firestore database is created
3. ✅ User profile exists in `sellers` collection
4. ✅ You can login and access the seller dashboard

---

## Need Help?

1. **Use the Setup Wizard** - It does everything automatically!
2. **Check Firebase Console** - Make sure database exists
3. **Check Browser Console** - Look for specific error messages

---

## Firebase Console Links

- **Project Overview:** https://console.firebase.google.com/project/shelfsync-6fedf
- **Firestore Database:** https://console.firebase.google.com/project/shelfsync-6fedf/firestore
- **Authentication:** https://console.firebase.google.com/project/shelfsync-6fedf/authentication
- **Project Settings:** https://console.firebase.google.com/project/shelfsync-6fedf/settings/general

---

**Last Updated:** 2026-01-06
