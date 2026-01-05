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
        console.log("Checking role for user:", user.email);
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const role = userData.role;
            console.log("Role found:", role);

            // Determine if we are in the 'pages' directory
            const isInsidePages = window.location.pathname.includes('/pages/');

            let targetPage = "";
            if (role === 'admin') targetPage = "admin-dashboard.html";
            else if (role === 'seller') targetPage = "seller-dashboard.html";
            else if (role === 'delivery') targetPage = "delivery-dashboard.html";
            else if (role === 'customer') targetPage = "all-books.html";

            if (targetPage) {
                // If we are not in 'pages/', we need to add the prefix
                let finalPath = isInsidePages ? targetPage : "pages/" + targetPage;
                console.log("Redirecting to:", finalPath);
                window.location.href = finalPath;
            } else {
                console.warn("Unknown role:", role);
                window.location.href = isInsidePages ? "../index.html" : "index.html";
            }
        } else {
            console.error("No user document found for UID:", user.uid);
            alert("User profile not found. Please ensure you have registered correctly.");
        }
    } catch (error) {
        console.error("Error in redirectBasedOnRole:", error);
        alert("Error fetching user data: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is already logged in for automatic redirection
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User already logged in, checking role...");
            // Only redirect if we are on a login page
            if (window.location.pathname.includes('login-')) {
                redirectBasedOnRole(user);
            }
        }
    });

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        try {
            // UI Feedback
            submitBtn.disabled = true;
            submitBtn.textContent = "Authenticating...";

            // 2. Authenticate with Firebase Auth
            console.log("Attempting login for:", email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            submitBtn.textContent = "Fetching profile...";
            await redirectBasedOnRole(user);

        } catch (error) {
            console.error("Login Error:", error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            let message = "Login failed. Please check your credentials.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Invalid email or password. Please check your credentials.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many failed attempts. Please try again later.";
            } else if (error.code === 'auth/network-request-failed') {
                message = "Network error. Please check your internet connection.";
            }

            alert(message);
        }
    });
});
