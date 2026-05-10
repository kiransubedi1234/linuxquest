// filepath: apps/web/src/hooks/useSync.ts
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { UserProgress, SyncState } from "@/types";
import { DEFAULT_USER_PROGRESS } from "@/types";
import { CURRICULUM } from "@/data/curriculum";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  debouncedFirestoreSync,
  fullSync,
  flushQueue,
} from "@/lib/sync";

const INITIAL_SYNC_STATE: SyncState = {
  status: "idle",
  lastSyncedAt: null,
  pendingActions: 0,
  errorMessage: null,
};

export function useSync(userId: string | null, isGuest: boolean) {
  const [progress, setProgressState] = useState<UserProgress | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(INITIAL_SYNC_STATE);
  const isInitialized = useRef(false);

  const updateSyncState = useCallback((partial: Partial<SyncState>) => {
    setSyncState((prev) => ({ ...prev, ...partial }));
  }, []);

  // Initial load: localStorage first, then Firestore sync
  useEffect(() => {
    if (!userId || isInitialized.current) return;
    isInitialized.current = true;

    const localData = loadFromLocalStorage(userId);

    if (isGuest) {
      const initial: UserProgress = localData ?? {
        ...DEFAULT_USER_PROGRESS,
        userId,
        isGuest: true,
      };
      setProgressState(initial);
      updateSyncState({ status: "idle" });
      return;
    }

    // Authenticated: sync with Firestore
    const localProgress: UserProgress = localData ?? {
      ...DEFAULT_USER_PROGRESS,
      userId,
      isGuest: false,
    };

    fullSync(userId, localProgress, updateSyncState).then((merged) => {
      let final = merged ?? localProgress;
      
      // Heart refill logic
      const now = Date.now();
      const lastUpdate = final.updatedAt;
      const hoursPassed = (now - lastUpdate) / (1000 * 60 * 60);
      const refillAmount = Math.floor(hoursPassed / 4); // 1 heart per 4 hours

      if (refillAmount > 0 && final.hearts < 5) {
        final = {
          ...final,
          hearts: Math.min(5, final.hearts + refillAmount),
          updatedAt: now,
        };
      }

      setProgressState(final);
      saveToLocalStorage(final);
    });
  }, [userId, isGuest, updateSyncState]);

  // Flush offline queue when coming back online
  useEffect(() => {
    const handleOnline = () => flushQueue(updateSyncState);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [updateSyncState]);

  const setProgress = useCallback(
    (updater: (prev: UserProgress) => UserProgress) => {
      setProgressState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        const withTimestamp: UserProgress = { ...next, updatedAt: Date.now() };

        // Always write to localStorage immediately
        saveToLocalStorage(withTimestamp);

        // Debounce Firestore write for authenticated users
        if (!isGuest && userId) {
          debouncedFirestoreSync(withTimestamp, updateSyncState);
        }

        return withTimestamp;
      });
    },
    [isGuest, userId, updateSyncState]
  );

  const unlockUnit = useCallback(
    (unitId: string) => {
      setProgress((prev) => {
        const unitIndex = CURRICULUM.findIndex((u) => u.id === unitId);
        if (unitIndex === -1) return prev;

        const unlocked = new Set(prev.unlockedUnits);
        // Unlock this unit and all previous units
        for (let i = 0; i <= unitIndex; i++) {
          const u = CURRICULUM[i];
          if (u) unlocked.add(u.id);
        }

        return {
          ...prev,
          unlockedUnits: Array.from(unlocked),
          currentUnitId: unitId,
        };
      });
    },
    [setProgress]
  );

  const completeUnit = useCallback(
    (unitId: string) => {
      setProgress((prev) => {
        const unitIndex = CURRICULUM.findIndex((u) => u.id === unitId);
        if (unitIndex === -1) return prev;

        const unlocked = new Set(prev.unlockedUnits);
        const completed = { ...prev.completedUnits };
        
        // Mark this and all previous units as unlocked
        for (let i = 0; i <= unitIndex; i++) {
          const u = CURRICULUM[i];
          if (u) unlocked.add(u.id);
        }
        
        // Mark this unit as completed
        completed[unitId] = true;
        
        // Unlock the NEXT unit if it exists
        const nextUnit = CURRICULUM[unitIndex + 1];
        if (nextUnit) {
          unlocked.add(nextUnit.id);
        }

        return {
          ...prev,
          unlockedUnits: Array.from(unlocked),
          completedUnits: completed,
          currentUnitId: nextUnit ? nextUnit.id : unitId,
        };
      });
    },
    [setProgress]
  );

  const updateProfile = useCallback(
    (updates: { displayName?: string; photoURL?: string }) => {
      setProgress((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setProgress]
  );

  return { progress, setProgress, unlockUnit, completeUnit, updateProfile, syncState };
}
