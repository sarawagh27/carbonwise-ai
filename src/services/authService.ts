import {
  AuthError,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export interface GoogleAuthProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
}

export function toGoogleAuthProfile(user: User): GoogleAuthProfile {
  return {
    uid: user.uid,
    displayName: user.displayName || "Eco Guardian",
    email: user.email || "",
    photoURL: user.photoURL
  };
}

export function configureAuthPersistence(): Promise<void> {
  return setPersistence(auth, browserLocalPersistence);
}

export async function signInWithGooglePopup(): Promise<GoogleAuthProfile> {
  await configureAuthPersistence();
  const result = await signInWithPopup(auth, googleProvider);
  return toGoogleAuthProfile(result.user);
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

export function observeAuthState(
  onChange: (user: User | null) => void | Promise<void>,
  onError?: (error: Error) => void
) {
  return onAuthStateChanged(auth, onChange, onError);
}

export function getAuthErrorMessage(error: unknown): string {
  const authError = error as Partial<AuthError>;

  switch (authError.code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase Console. Enable Authentication > Sign-in method > Google.";
    case "auth/unauthorized-domain":
      return `This domain (${window.location.hostname}) is not authorized in Firebase Authentication settings. Add it under Authentication > Settings > Authorized domains in Firebase Console.`;
    case "auth/invalid-api-key":
      return "Firebase rejected the API key. Check VITE_FIREBASE_API_KEY in .env.local.";
    case "auth/configuration-not-found":
      return "Firebase Authentication is not configured for this project. Enable Authentication in Firebase Console.";
    case "auth/invalid-auth-domain":
      return "Firebase authDomain is invalid. Check VITE_FIREBASE_AUTH_DOMAIN in .env.local.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups and try again.";
    case "auth/cancelled-popup-request":
      return "Another Google sign-in window is already open.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists for this email with a different sign-in method.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check your connection and try again.";
    default:
      return authError.code
        ? `Google sign-in failed (${authError.code}). Please try again.`
        : "Google sign-in failed. Please try again.";
  }
}
