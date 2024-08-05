// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  authDomain: "pantry-firstprj.firebaseapp.com",
  projectId: "pantry-firstprj",
  storageBucket: "pantry-firstprj.appspot.com",
  messagingSenderId: "222088674076",
  appId: "1:222088674076:web:65602148b4db80c2b4d8d9",
  measurementId: "G-KS2Z9HW2L8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Conditionally initialize Firebase Analytics
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export {firestore, auth, provider};
