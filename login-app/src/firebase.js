// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmiNWmZzRREpn5G9vc1olx_37Q0mCpMgg",
  authDomain: "civisight-f238a.firebaseapp.com",
  projectId: "civisight-f238a",
  storageBucket: "civisight-f238a.firebasestorage.app",
  messagingSenderId: "426446490615",
  appId: "1:426446490615:web:e944e7aad3ccca4561bcf2",
  measurementId: "G-TCWWTZ5D3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export necessary Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
