# 🔥 QUICK FIX: Firebase "Client is Offline" Error

## THE PROBLEM
Error: "Failed to get document because the client is offline"
Reason: Your Firestore database doesn't exist yet in Firebase Console

---

## THE FIX (2 STEPS - 5 MINUTES)

### STEP 1: Create Firestore Database ⚡

**DO THIS FIRST - IT'S REQUIRED!**

1. **Open this link in your browser:**
   ```
   https://console.firebase.google.com/project/shelfsync-6fedf/firestore
   ```

2. **You will see a page with "Create database" button**
   - Click the **"Create database"** button

3. **Choose database location:**
   - Select: **nam5 (us-central)** OR your nearest location
   - Click **"Next"**

4. **Set security rules:**
   - Select: **"Start in test mode"**
   - Click **"Enable"**

5. **Wait 1-2 minutes** for the database to be created
   - You'll see "Cloud Firestore" interface when ready

---

### STEP 2: Create Your User Account 👤

**After Step 1 is complete:**

**Option A - Use the Simple Tool (RECOMMENDED):**

1. Open this file in your browser (double-click it):
   ```
   C:\Users\jeeva bharathi\OneDrive\Desktop\ShelfSync-app\firebase-direct-fix.html
   ```

2. Click the **"Create User Account"** button

3. Wait for success message

4. Done! Go to login page

---

**Option B - Manual (Browser Console):**

1. Open your Seller Login page:
   ```
   C:\Users\jeeva bharathi\OneDrive\Desktop\ShelfSync-app\pages\login-seller.html
   ```

2. Press **F12** to open Developer Console

3. Click on **"Console"** tab

4. **Copy and paste this entire code:**

```javascript
(async function() {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const app = initializeApp({
        apiKey: "AIzaSyDfyqcchPmY0MvKCaJQmwP0ILyf9UODMis",
        authDomain: "shelfsync-6fedf.firebaseapp.com",
        projectId: "shelfsync-6fedf",
        storageBucket: "shelfsync-6fedf.firebasestorage.app",
        messagingSenderId: "328141524902",
        appId: "1:328141524902:web:5616c7b58d48deda3f0967"
    });
    
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const email = 'jackdoe628@gmail.com';
    const password = 'TestPassword123';
    
    try {
        console.log('Creating user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ User created! UID:', userCredential.user.uid);
        
        console.log('Creating seller profile...');
        await setDoc(doc(db, 'sellers', userCredential.user.uid), {
            email: email,
            role: 'seller',
            storeName: 'My Bookstore',
            verified: true,
            createdAt: new Date().toISOString()
        });
        
        console.log('✅ SUCCESS! You can now login!');
        alert('✅ Account created! You can now login.');
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('✅ User already exists! You can login now.');
            alert('✅ User already exists! Try logging in.');
        } else {
            console.error('❌ Error:', error.message);
            alert('Error: ' + error.message);
        }
    }
})();
```

5. Press **Enter**

6. Wait for success message

---

## YOUR LOGIN CREDENTIALS

After setup is complete, use these to login:

```
Email:    jackdoe628@gmail.com
Password: TestPassword123
Role:     Seller
```

---

## VERIFY IT WORKED

1. Go to your Seller Login page
2. Enter the credentials above
3. Click "Login"
4. You should be redirected to the Seller Dashboard

If you still see an error, come back to this guide and check if you completed Step 1 properly.

---

## COMMON ERRORS & FIXES

### "database (default) does not exist"
→ **You skipped Step 1!** Go to Firebase Console and create the database.

### "permission denied"
→ **Database not in Test Mode.** Go to Firebase Console → Firestore → Rules tab
   Change to:
   ```
   allow read, write: if request.time < timestamp.date(2026, 2, 6);
   ```

### "email already in use"
→ **Good! User exists.** Just try logging in with the credentials above.

### Still not working?
→ **Check Firebase Console:** https://console.firebase.google.com/project/shelfsync-6fedf/firestore
   - Make sure you see "Cloud Firestore" with a database icon (not "Get started")
   - Make sure you see "sellers" collection with at least 1 document

---

## FILES TO USE

1. **firebase-direct-fix.html** ← Use this! (Simple button to create user)
2. **QUICK_FIX_GUIDE.md** ← You're reading this now

---

## SUMMARY

✅ Step 1: Create Firestore database in Firebase Console (REQUIRED!)
✅ Step 2: Create user account (use firebase-direct-fix.html)
✅ Login with: jackdoe628@gmail.com / TestPassword123
✅ Done!

---

Last Updated: 2026-01-06
