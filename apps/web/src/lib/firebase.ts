// filepath: apps/web/src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";

// ─── Config ───────────────────────────────────────────────────────────────────

// Helper to strip quotes if they exist in env vars
const cleanEnv = (val: string | undefined) => val?.replace(/^["'](.+)["']$/, "$1");

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

const isConfigValid =
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_firebase_api_key" &&
  firebaseConfig.apiKey !== "your_api_key";

// ─── Singleton Init ───────────────────────────────────────────────────────────

let app: FirebaseApp | undefined;
let authInstance: any = null;
let dbInstance: any = null;

if (isConfigValid) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig as any);
    } else {
      app = getApps()[0]!;
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);

    // Enable offline persistence (browser only)
    if (typeof window !== "undefined") {
      enableMultiTabIndexedDbPersistence(dbInstance).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Firestore persistence: multiple tabs open");
        } else if (err.code === "unimplemented") {
          console.warn("Firestore persistence: browser does not support IndexedDB");
        }
      });
    }
  } catch (err) {
    console.error("Firebase failed to initialize:", err);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "⚠️ Firebase configuration is missing or invalid. Authentication and Cloud Sync are disabled. Please check your apps/web/.env.local file."
    );
  }
}

export const auth = authInstance;
export const db = dbInstance;

// ─── Auth Providers ───────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

// ─── Auth Functions ───────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    // If no auth, immediately trigger null user (unauthenticated/guest)
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ─── Firestore Progress CRUD ──────────────────────────────────────────────────

const PROGRESS_COLLECTION = "userProgress";

export async function fetchProgressFromFirestore(userId: string) {
  if (!db) return null;
  const ref = doc(db, PROGRESS_COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveProgressToFirestore(
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!db) return;
  const ref = doc(db, PROGRESS_COLLECTION, userId);
  await setDoc(
    ref,
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function updateProgressField(
  userId: string,
  fields: Record<string, unknown>
): Promise<void> {
  if (!db) return;
  const ref = doc(db, PROGRESS_COLLECTION, userId);
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
}
