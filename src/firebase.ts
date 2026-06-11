// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDa588mjN9KH18JZ0z6gRfHEKss5Xi5Y1A",
  authDomain: "finora-afc4c.firebaseapp.com",
  projectId: "finora-afc4c",
  storageBucket: "finora-afc4c.firebasestorage.app",
  messagingSenderId: "164721700712",
  appId: "1:164721700712:web:d79e8870e156d02941b0dd",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Auth con persistencia (el usuario se mantiene logueado al recargar)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) =>
  console.error("Error setting persistence:", error),
);

export const db = getFirestore(app);

export default app;
