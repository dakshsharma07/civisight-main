import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app); 