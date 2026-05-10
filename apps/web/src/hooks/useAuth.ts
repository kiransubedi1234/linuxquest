// filepath: apps/web/src/hooks/useAuth.ts
"use client";
import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { onAuthChange, signInWithGoogle, signOutUser } from "@/lib/firebase";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User; isGuest: false }
  | { status: "guest"; user: null; isGuest: true }
  | { status: "unauthenticated"; user: null; isGuest: false };

const GUEST_KEY = "linuxquest_guest_mode";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        localStorage.removeItem(GUEST_KEY);
        setAuthState({ status: "authenticated", user, isGuest: false });
      } else {
        const isGuest = localStorage.getItem(GUEST_KEY) === "true";
        if (isGuest) {
          setAuthState({ status: "guest", user: null, isGuest: true });
        } else {
          setAuthState({ status: "unauthenticated", user: null, isGuest: false });
        }
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setAuthState({ status: "loading" });
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setAuthState({ status: "unauthenticated", user: null, isGuest: false });
      throw err; // Re-throw to allow UI to handle it
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, "true");
    setAuthState({ status: "guest", user: null, isGuest: true });
  };

  const logout = async () => {
    localStorage.removeItem(GUEST_KEY);
    await signOutUser();
    setAuthState({ status: "unauthenticated", user: null, isGuest: false });
  };

  return { authState, loginWithGoogle, continueAsGuest, logout };
}
