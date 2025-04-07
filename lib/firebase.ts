import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug log for environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Firebase API Key is missing!");
}

// Initialize Firebase and Firestore
let app: FirebaseApp;
let firestore: Firestore;

// We need to create a little dummy firestore for SSR
// This is a workaround for Next.js serverless functions
class DummyFirestore {
  collection() {
    return {
      doc: () => ({
        get: async () => ({
          exists: false,
          data: () => null
        }),
        set: async () => null
      })
    };
  }
}

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  firestore = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // @ts-expect-error - Provide a dummy implementation that won't crash
  firestore = new DummyFirestore() as Firestore;
}

export { firestore }; 