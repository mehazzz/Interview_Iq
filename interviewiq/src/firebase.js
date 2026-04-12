// src/firebase.js
// Replace the values below with your own Firebase project config
// https://console.firebase.google.com → Project Settings → Your apps

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAy6rIOqHJac428zxQh0EB7CwKzeDxsIg4",
  authDomain: "freelancehub-a830e.firebaseapp.com",
  projectId: "freelancehub-a830e",
  storageBucket: "freelancehub-a830e.firebasestorage.app",
  messagingSenderId: "345558183516",
  appId: "1:345558183516:web:4ed982ccd6ee9bc7c20099",
  measurementId: "G-TRT5RD5B86"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
