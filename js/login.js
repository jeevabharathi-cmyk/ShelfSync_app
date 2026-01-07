import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

async function redirectBasedOnRole(user) {
    const path = window.location.pathname;

    // STRICT: Seller portal -> 'sellers' collection, Others -> 'users' collection
    const collectionName = path.includes("login-seller") ? "sellers" : "users";

    console.log(`[Login] Checking role for UID: ${user.uid} in collection: ${collectionName}`);

    const snap = await getDoc(doc(db, collectionName, user.uid));

    if (!snap.exists()) {
        console.error(`[Login] Document not found in ${collectionName}`);
        throw new Error(`User profile not found in ${collectionName}. Please contact support.`);
    }

    const role = snap.data().role;
    console.log(`[Login] User role found: ${role}`);

    // Portal validation
    if (path.includes("login-seller") && role !== "seller")
        throw new Error("Access denied. Seller account required.");

    if (path.includes("login-admin") && role !== "admin")
        throw new Error("Access denied. Admin account required.");

    if (path.includes("login-customer") && role !== "customer")
        throw new Error("Access denied. Customer account required.");

    // Redirect
    if (role === "admin") window.location.href = "admin-dashboard.html";
    if (role === "seller") window.location.href = "seller-dashboard.html";
    if (role === "customer") window.location.href = "all-books.html";
}

document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, (user) => {
        if (user && window.location.pathname.includes("login-")) {
            redirectBasedOnRole(user).catch(console.error);
        }
    });

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await redirectBasedOnRole(cred.user);
        } catch (err) {
            alert(err.message);
        }
    });
});
