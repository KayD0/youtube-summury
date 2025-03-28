// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase configuration is properly loaded
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error('Firebase configuration is missing or invalid. Make sure your .env file is properly set up.');
}

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Enable persistence to allow users to stay logged in
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase persistence set to local');
    })
    .catch(error => {
      console.warn('Auth persistence error:', error);
    });
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Provide fallback for development
  if (!app) app = initializeApp({ projectId: 'demo-project' });
  if (!auth) auth = getAuth(app);
}

// Authentication state observer
let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user;
  
  // Dispatch custom event when auth state changes
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
  
  // Update UI based on auth state
  updateUI();
});

// Update UI based on authentication state
function updateUI() {
  const authLinks = document.getElementById('authLinks');
  const userInfo = document.getElementById('userInfo');
  
  if (!authLinks || !userInfo) return;
  
  if (currentUser) {
    // User is signed in
    authLinks.style.display = 'none';
    userInfo.style.display = 'block';
    userInfo.querySelector('.user-email').textContent = currentUser.email;
  } else {
    // User is signed out
    authLinks.style.display = 'block';
    userInfo.style.display = 'none';
  }
}

// Sign up with email and password
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { user: null, error: error.message };
  }
}

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: error.message };
  }
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!currentUser;
}

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  isAuthenticated
};
