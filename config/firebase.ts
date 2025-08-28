import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w',
  authDomain: 'nightly-efa29.firebaseapp.com',
  projectId: 'nightly-efa29',
  storageBucket: 'nightly-efa29.firebasestorage.app',
  messagingSenderId: '939461087699',
  appId: '1:939461087699:web:9fbdc666ba81df44315f26',
  measurementId: 'G-NSMDX7R163',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
