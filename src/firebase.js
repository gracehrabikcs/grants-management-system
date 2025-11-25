// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// If you want analytics, import safely (only runs in browser):
// import { getAnalytics } from "firebase/analytics";

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

// Safe analytics loading (optional)
// let analytics;
// if (typeof window !== "undefined") {
//   analytics = getAnalytics(app);
// }

// ✅ THIS IS THE IMPORTANT PART
export const db = getFirestore(app);

// Optional exports
export { app };
