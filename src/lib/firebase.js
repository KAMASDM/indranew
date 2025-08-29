// src/lib/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYJ1cfcbFM9oqNx-aT_SuftPRZbzJWHx8",
  authDomain: "indra-feacb.firebaseapp.com",
  projectId: "indra-feacb",
  storageBucket: "indra-feacb.appspot.com", // Corrected storage bucket
  messagingSenderId: "469917811696",
  appId: "1:469917811696:web:0a14eb34cbe3d27f619335",
  measurementId: "G-LVPHGE2G61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };