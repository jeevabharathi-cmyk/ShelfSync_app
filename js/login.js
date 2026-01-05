import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Generic Login logic for ShelfSync
 * Authenticates user and redirects based on their role in Firestore
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // 1. Authenticate with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Fetch user document from Firestore to check role
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                console.log("User data:", userData);

                // 3. Redirect based on role
                const role = userData.role;

                if (role === 'admin') {
                    window.location.href = "admin-dashboard.html";
                } else if (role === 'seller') {
                    window.location.href = "seller-dashboard.html";
                } else if (role === 'customer') {
                    // Redirect to browse books for customers
                    window.location.href = "all-books.html";
                } else {
                    // Default fallback
                    window.location.href = "../index.html";
                }
            } else {
                alert("User profile not found in database.");
            }

        } catch (error) {
            console.error("Login Error:", error);
            let message = "Login failed. Please check your credentials.";

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many failed attempts. Please try again later.";
            }

            alert(message);
        }
    });
});
