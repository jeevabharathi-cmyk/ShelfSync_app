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
            const snap = await getDoc(doc(db, "users", user.uid));

            if (snap.exists() && snap.data().role === "seller") {
                console.log("Seller authenticated:", snap.data());
                window.location.href = "seller-dashboard.html";
            } else {
                alert("Access denied: Not a seller");
                // Optional: Sign out if they shouldn't be logged in at all on this page
                // await auth.signOut();
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
