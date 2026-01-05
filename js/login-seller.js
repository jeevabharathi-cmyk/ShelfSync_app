import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Login logic for Seller Portal
 * Authenticates user and verifies their role in Firestore
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
                // For login-seller.js, we specifically check for 'seller' role
                if (userData.role === 'seller') {
                    alert(`Welcome back, ${userData.firstName}!`);
                    window.location.href = "seller-dashboard.html";
                } else if (userData.role === 'admin') {
                    // Admins might also log in here, but usually have their own page
                    window.location.href = "admin-dashboard.html";
                } else {
                    // If a customer tries to log in to the seller portal
                    alert("Access denied. This account is not registered as a seller.");
                    // Optional: Sign out if they shouldn't be logged in at all on this page
                    // await auth.signOut();
                }
            } else {
                alert("User profile not found in database. Please contact support.");
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
