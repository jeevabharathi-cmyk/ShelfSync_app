import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

async function redirectBasedOnRole(user) {
  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) {
    throw new Error("User profile not found. Contact admin.");
  }

  const role = snap.data().role;
  const path = window.location.pathname;

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

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await redirectBasedOnRole(cred.user);
    } catch (err) {
      alert(err.message);
    }
  });
});
