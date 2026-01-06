import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Signup logic for ShelfSync
 * Handles user registration and profile creation in Firestore
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        // Basic validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            alert("Password should be at least 6 characters long.");
            return;
        }

        try {
            // 1. Create user in Firebase Authentication
            // MUST include this code:
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            // 2. Create user document in Firestore
            if (role === 'seller') {
                // MUST include this code:
                await setDoc(doc(db, "sellers", cred.user.uid), {
                    email: email,
                    role: "seller",
                    createdAt: new Date()
                });
            } else {
                // For other roles, we still use the users collection
                await setDoc(doc(db, "users", cred.user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: role,
                    createdAt: new Date()
                });
            }

            alert("Account created successfully!");

            // 3. Redirect based on role
            if (role === 'seller') {
                window.location.href = 'login-seller.html';
            } else {
                window.location.href = 'login-customer.html';
            }

        } catch (error) {
            console.error("Signup Error:", error);
            let message = "An error occurred during signup.";
            if (error.code === 'auth/email-already-in-use') {
                message = "This email is already registered.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Please enter a valid email address.";
            } else if (error.code === 'auth/weak-password') {
                message = "The password is too weak.";
            }
            alert(message);
        }
    });
});

