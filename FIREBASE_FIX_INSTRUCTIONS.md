# Firebase Database Fix Script
# Copy and paste this into your browser console when on any ShelfSync page

## CRITICAL: You need to be logged in before running this script!

## Instructions:
1. Go to: https://shelfsync-6fedf.web.app/pages/login-seller.html
2. Log in with your credentials (jackdoe628@gmail.com)
3. Open Developer Console (F12 or Right-click > Inspect > Console tab)
4. Copy and paste the script below:

```javascript
// Firebase Database Initialization Script
(async function() {
    console.log('🔥 Starting Firebase Database Fix...');
    
    try {
        // Import Firebase modules
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        
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
        
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
            console.error('❌ You must be logged in first!');
            alert('Please log in first, then run this script again.');
            return;
        }
        
        console.log(`✅ Logged in as: ${user.email}`);
        console.log(`UID: ${user.uid}`);
        
        // Create seller profile
        console.log('📝 Creating seller profile in Firestore...');
        await setDoc(doc(db, 'sellers', user.uid), {
            email: user.email,
            role: 'seller',
            createdAt: new Date(),
            storeName: 'My Bookstore',
            verified: true
        });
        
        console.log('✅ Seller profile created!');
        
        // Verify it was saved
        const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
        if (sellerDoc.exists()) {
            console.log('✅ Profile verified in database:');
            console.log(sellerDoc.data());
            alert('✅ Success! Your seller profile has been created. Refresh the page and try logging in again.');
        } else {
            console.error('❌ Profile was not found after creation');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (error.message.includes('database (default) does not exist')) {
            alert('⚠️ The Firestore database needs to be created in Firebase Console first.\n\n1. Go to: https://console.firebase.google.com/project/shelfsync-6fedf/firestore\n2. Click "Create Database"\n3. Choose Test Mode\n4. Then run this script again');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
})();
```

## Alternative: Use the Web Tool
If the console script doesn't work, use this page:
http://localhost:3000/database-fix.html (when running locally)
OR
https://shelfsync-6fedf.web.app/database-fix.html (when deployed)

## What if the database still doesn't exist?
You MUST create it manually in Firebase Console:
1. Go to: https://console.firebase.google.com/project/shelfsync-6fedf/firestore
2. Click "Create Database"
3. Location: nam5 (us-central)
4. Security Rules: Start in Test Mode
5. Click "Enable"

After creating the database, run this script again.
