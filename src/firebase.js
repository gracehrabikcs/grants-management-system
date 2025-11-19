// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);