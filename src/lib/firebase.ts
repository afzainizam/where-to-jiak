// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvBKfG6FM1_p9ENDoISZAyDnTrl6kdpPI",
  authDomain: "where-to-jiak.firebaseapp.com",
  projectId: "where-to-jiak",
  storageBucket: "where-to-jiak.firebasestorage.app",
  messagingSenderId: "610702509654",
  appId: "1:610702509654:web:8427da1f4f82f6f07e5df7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
