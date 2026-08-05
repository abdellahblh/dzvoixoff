import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Replace this with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc8OLbt64rFCw3mEs2sKrIGJFx1W2kdlI",
  authDomain: "dzvoixoff.online",
  projectId: "gen-lang-client-0378906902",
  storageBucket: "gen-lang-client-0378906902.firebasestorage.app",
  messagingSenderId: "737941743498",
  appId: "1:737941743498:web:a7f666e670afa6e1ac4a73"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
