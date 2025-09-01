// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRK_6co21RcoCe0NpW6YCL2b9jQP7OR7c",
  authDomain: "demain-thailand.firebaseapp.com",
  projectId: "demain-thailand",
  storageBucket: "demain-thailand.appspot.com",
  messagingSenderId: "800557978550",
  appId: "1:800557978550:web:d763bc230ff9e39072e717",
  measurementId: "G-2PQ1D1093H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app); // Initialize Firestore

// Export Firestore
export { db };
