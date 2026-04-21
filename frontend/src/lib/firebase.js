import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// These should be populated in a .env.local file.
// If you're running this without .env vars, the app will throw an error requesting them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key-replace-me",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-bucket.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:00000000:web:123456789",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-12345"
}

let app
let auth
let db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (error) {
  console.warn("Firebase failed to initialize. Did you supply .env variables? Proceeding with offline dummy auth.")
  // Mock fallback to prevent immediate crashes for testing
  auth = { onAuthStateChanged: (cb) => { cb(null); return () => {} }, currentUser: null, signInWithEmailAndPassword: async () => {}, createUserWithEmailAndPassword: async () => {}, signOut: async () => {} }
  db = {}
}

export { auth, db }
