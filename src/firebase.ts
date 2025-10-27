// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDR_vUBB7Tkbz4WLHmD5CY1BdN3SWsrFV4",
  authDomain: "lorena-ventas.firebaseapp.com",
  projectId: "lorena-ventas",
  storageBucket: "lorena-ventas.firebasestorage.app",
  messagingSenderId: "754425739068",
  appId: "1:754425739068:web:4541797362d5d699be5039"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
