// Firebase Configuration - Replace with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyDfyqcchPmY0MvKCaJQmwP0ILyf9UODMis",
    authDomain: "shelfsync-6fedf.firebaseapp.com",
    projectId: "shelfsync-6fedf",
    storageBucket: "shelfsync-6fedf.firebasestorage.app",
    messagingSenderId: "328141524902",
    appId: "1:328141524902:web:5616c7b58d48deda3f0967",
    measurementId: "G-2SSZLVQ1Z8"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Services
const db = firebase.firestore();
const auth = firebase.auth();

// Make them available globally if needed (though they usually are when defined with const/var in global scope)
window.db = db;
window.auth = auth;
