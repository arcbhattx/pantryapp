// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBSASE_API_KEY,
  authDomain: "inventory-management-6b95b.firebaseapp.com",
  projectId: "inventory-management-6b95b",
  storageBucket: "inventory-management-6b95b.appspot.com",
  messagingSenderId: "744896579340",
  appId: "1:744896579340:web:f69b7d072483ba3eca2b29",
  measurementId: "G-9HBWN8SPXR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}