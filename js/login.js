import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Generic Login logic for ShelfSync
 * Authenticates user and redirects based on their role in Firestore
 */

// Function to handle redirection based on role
async function redirectBasedOnRole(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const role = userData.role;
            console.log("Redirecting user with role:", role);

            if (role === 'admin') {
                window.location.href = "admin-dashboard.html";
            } else if (role === 'seller') {
                window.location.href = "seller-dashboard.html";
            } else if (role === 'delivery') {
                window.location.href = "delivery-dashboard.html";
            } else if (role === 'customer') {
                window.location.href = "all-books.html";
            } else {
                window.location.href = "../index.html";
            }
        } else {
            console.warn("User profile not found in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is already logged in for automatic redirection
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User already logged in, checking role...");
            redirectBasedOnRole(user);
        }
    });

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // 2. Authenticate with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Redirection will be handled by onAuthStateChanged or we can call it here for faster response
            await redirectBasedOnRole(user);

        } catch (error) {
            console.error("Login Error:", error);
            let message = error.message; // Default to Firebase error message for better debugging

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Invalid email or password. Please check your credentials.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many failed attempts. Please try again later.";
            }

            alert(message);
        }
    });
});
