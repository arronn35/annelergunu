import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);

export let app = null;
export let auth = null;
export let db = null;
export let storage = null;

export const authReady = firebaseEnabled
  ? (() => {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      return signInAnonymously(auth)
        .then((credential) => credential.user)
        .catch((error) => {
          console.warn('Firebase anonymous auth failed; local fallback is active.', error);
          return null;
        });
    })()
  : Promise.resolve(null);

if (!firebaseEnabled) {
  console.warn('Firebase environment variables are missing. The site is running in local demo mode.');
}
