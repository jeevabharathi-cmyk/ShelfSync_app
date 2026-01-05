import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfyqcchPmY0MvKCaJQmwP0ILyf9UODMis",
    authDomain: "shelfsync-6fedf.firebaseapp.com",
    projectId: "shelfsync-6fedf",
    storageBucket: "shelfsync-6fedf.firebasestorage.app",
    messagingSenderId: "328141524902",
    appId: "1:328141524902:web:5616c7b58d48deda3f0967",
    measurementId: "G-2SSZLVQ1Z8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

