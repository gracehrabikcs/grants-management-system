// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <-- make sure this is imported

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCYWBye_BZ5ZA10dYxjo1PDAAcWL4yuAGs",
  authDomain: "grants-management-system-a8733.firebaseapp.com",
  projectId: "grants-management-system-a8733",
  storageBucket: "grants-management-system-a8733.firebasestorage.app",
  messagingSenderId: "546380359078",
  appId: "1:546380359078:web:a10469958161b332a61b67",
  measurementId: "G-49RJWWPGJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Optional exports
export { app };
const db = getFirestore(app);       // Firestore database
const analytics = getAnalytics(app);


export { db }; // <-- export db so you can import it elsewhere