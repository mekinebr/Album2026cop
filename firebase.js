import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvyccKuqTDhtdNS4mMyqm3F3Gu7kfeKd4",
  authDomain: "album-copa-2026-6812c.firebaseapp.com",
  projectId: "album-copa-2026-6812c",
  storageBucket: "album-copa-2026-6812c.firebasestorage.app",
  messagingSenderId: "293116985913",
  appId: "1:293116985913:web:a9a5fb5de4cfdea7ef83e8",
  measurementId: "G-B2Y961B68T"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth);
