import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "milo-df533.firebaseapp.com",
  projectId: "milo-df533",
  storageBucket: "milo-df533.firebasestorage.app",
  messagingSenderId: "853180235866",
  appId: "1:853180235866:web:d805deb502b4975617d863"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }

