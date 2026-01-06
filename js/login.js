import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * Generic Login logic for ShelfSync
 * Authenticates user and redirects based on their role in Firestore
 */

// Function to handle redirection based on role
async function redirectBasedOnRole(user) {
    try {
        const currentPath = window.location.pathname;
        console.log("Checking role for user:", user.email, "Current Page:", currentPath);

        // Determine which portal the user is logging in from
        let expectedRole = null;
        if (currentPath.includes('login-seller.html')) {
            expectedRole = 'seller';
        } else if (currentPath.includes('login-admin.html')) {
            expectedRole = 'admin';
        } else if (currentPath.includes('login-customer.html')) {
            expectedRole = 'customer';
        }

        let actualRole = null;

        // Try to get the user's actual role from Firestore
        try {
            let userDocRef = doc(db, "users", user.uid);
            let userSnap = await getDoc(userDocRef);

            if (!userSnap.exists()) {
                console.log("User not found in 'users' collection, checking 'sellers'...");
                userDocRef = doc(db, "sellers", user.uid);
                userSnap = await getDoc(userDocRef);
            }

            if (userSnap.exists()) {
                actualRole = userSnap.data().role;
                console.log("Role from Firestore:", actualRole);
            }
        } catch (dbError) {
            console.warn("Firestore error:", dbError);

            // FALLBACK: If database doesn't exist and user is on a specific portal, use that
            if (expectedRole && (dbError.code === 'not-found' || dbError.message.includes('database (default) does not exist'))) {
                console.log("Firestore unavailable. Using portal-based role:", expectedRole);
                actualRole = expectedRole;
            } else {
                throw dbError;
            }
        }

        // Validate that the user's role matches the portal they're using
        if (expectedRole && actualRole && expectedRole !== actualRole) {
            throw new Error(`Access denied. This portal is for ${expectedRole}s only. Your account is registered as a ${actualRole}.`);
        }

        // Use actualRole if we have it, otherwise fall back to expectedRole
        const role = actualRole || expectedRole;

        if (role) {
            console.log("Final role determined:", role);
            const isInsidePages = currentPath.includes('/pages/');

            let targetPage = "";
            if (role === 'admin') targetPage = "admin-dashboard.html";
            else if (role === 'seller') targetPage = "seller-dashboard.html";
            else if (role === 'delivery') targetPage = "delivery-dashboard.html";
            else if (role === 'customer') targetPage = "all-books.html";

            if (targetPage) {
                let finalPath = isInsidePages ? targetPage : "pages/" + targetPage;
                console.log("Redirecting to:", finalPath);
                window.location.href = finalPath;
                return;
            }
        }

        throw new Error("Could not determine user role. Please ensure you have registered correctly.");

    } catch (error) {
        console.error("Error in redirectBasedOnRole:", error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is already logged in for automatic redirection
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User already logged in, checking role...");
            // Only redirect if we are on a login page
            if (window.location.pathname.includes('login-')) {
                redirectBasedOnRole(user).catch(err => {
                    console.error("Auto-redirect failed:", err);
                });
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
            } else if (error.message) {
                message = error.message;
            }

            alert(message);
        }
    });
});
