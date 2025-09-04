import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR FIREBASE CONFIGURATION OBJECT FROM GOOGLE HERE ---
// It is the part that starts with: const firebaseConfig = { ... };
const firebaseConfig = {
  apiKey: "AIzaSyC9uJIOC_Psb-4Qpl_chwax8oeVh-dNY00",
  authDomain: "fintrack-app-1.firebaseapp.com",
  projectId: "fintrack-app-1",
  storageBucket: "fintrack-app-1.firebasestorage.app",
  messagingSenderId: "571303358474",
  appId: "1:571303358474:web:d00da557b5dd7d1554aff3",
  measurementId: "G-YXR1Z8QHLD"
};
// ------------------------------------------------------------------


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();