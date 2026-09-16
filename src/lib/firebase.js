// src/lib/firebase.js

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
// Opt-in local integration tests use an isolated demo project, never production.
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
if (useEmulators && !globalThis.__indraEmulatorsConnected) {
  connectFirestoreEmulator(db, '127.0.0.1', 8180);
  connectStorageEmulator(storage, '127.0.0.1', 9299);
  globalThis.__indraEmulatorsConnected = true;
}

// Conditionally initialize Analytics only on the client side
let analytics;
if (typeof window !== 'undefined' && !useEmulators) {
  // Check if Analytics is supported in the current environment
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(error => console.warn('Analytics unavailable:', error));
}

export { db, storage, analytics };
