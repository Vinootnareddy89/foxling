// src/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            "AIzaSyAODZqosuQTHF5UkqDh5iaiqBzgLNNlsCY",
  authDomain:        "foxling-44ccf.firebaseapp.com",
  projectId:         "foxling-44ccf",
  storageBucket:     "foxling-44ccf.firebasestorage.app",
  messagingSenderId: "300227680073",
  appId:             "1:300227680073:web:b67ba54cde0d9a6bd8ac98",
  measurementId:     "G-QS07D1VWVP",
};

// Prevent duplicate initialization during Expo hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use AsyncStorage for auth persistence on native devices
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
