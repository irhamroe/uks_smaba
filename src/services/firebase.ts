import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCpRKSL7Qqgoh-_wuwUE8esrRx80oqdhP4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "uks-smaba.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://uks-smaba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "uks-smaba",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "uks-smaba.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "283773406100",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:283773406100:web:df55cf28b117c7d4a19d81",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-097BYHZGGK"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
