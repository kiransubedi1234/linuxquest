// filepath: apps/web/src/lib/sync.ts
import type { UserProgress, SyncState } from "@/types";
import { validateProgress, mergeProgress } from "@/lib/validators";
import {
  fetchProgressFromFirestore,
  saveProgressToFirestore,
} from "@/lib/firebase";

const LS_KEY = "linuxquest_progress";
const DEBOUNCE_MS = 2000;

// ─── localStorage ─────────────────────────────────────────────────────────────

export function loadFromLocalStorage(userId: string): UserProgress | null {
  try {
    const raw = localStorage.getItem(`${LS_KEY}_${userId}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = validateProgress(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(progress: UserProgress): void {
  try {
    localStorage.setItem(
      `${LS_KEY}_${progress.userId}`,
      JSON.stringify(progress)
    );
  } catch (err) {
    console.error("localStorage write failed:", err);
  }
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

const QUEUE_KEY = "linuxquest_sync_queue";

export interface QueuedAction {
  userId: string;
  progress: UserProgress;
  queuedAt: number;
}

export function enqueueAction(action: QueuedAction): void {
  try {
    const existing = getQueue();
    // Keep only the latest snapshot per user
    const filtered = existing.filter((a) => a.userId !== action.userId);
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...filtered, action]));
  } catch {
    // ignore quota errors
  }
}

export function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedAction[];
  } catch {
    return [];
  }
}

export function clearQueueForUser(userId: string): void {
  const filtered = getQueue().filter((a) => a.userId !== userId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

// ─── Firestore Sync ───────────────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedFirestoreSync(
  progress: UserProgress,
  onStatusChange: (state: Partial<SyncState>) => void
): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  onStatusChange({ status: "idle", pendingActions: 1 });

  debounceTimer = setTimeout(async () => {
    if (!navigator.onLine) {
      enqueueAction({ userId: progress.userId, progress, queuedAt: Date.now() });
      onStatusChange({ status: "offline", pendingActions: 1 });
      return;
    }

    onStatusChange({ status: "syncing" });
    try {
      await saveProgressToFirestore(progress.userId, progress as unknown as Record<string, unknown>);
      onStatusChange({ status: "synced", lastSyncedAt: Date.now(), pendingActions: 0, errorMessage: null });
      clearQueueForUser(progress.userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown sync error";
      onStatusChange({ status: "error", errorMessage: message });
      enqueueAction({ userId: progress.userId, progress, queuedAt: Date.now() });
    }
  }, DEBOUNCE_MS);
}

// ─── Full Sync (initial load + conflict resolution) ───────────────────────────

export async function fullSync(
  userId: string,
  localProgress: UserProgress | null,
  onStatusChange: (state: Partial<SyncState>) => void
): Promise<UserProgress | null> {
  onStatusChange({ status: "syncing" });
  try {
    const remote = await fetchProgressFromFirestore(userId);
    if (!remote && !localProgress) {
      onStatusChange({ status: "synced", pendingActions: 0 });
      return null;
    }
    if (!remote) {
      // First time — push local to server
      if (localProgress) {
        await saveProgressToFirestore(userId, localProgress as unknown as Record<string, unknown>);
      }
      onStatusChange({ status: "synced", pendingActions: 0 });
      return localProgress;
    }

    const remoteValidation = validateProgress({ ...remote, userId });
    if (!remoteValidation.success) {
      onStatusChange({ status: "synced", pendingActions: 0 });
      return localProgress;
    }

    const merged = localProgress
      ? mergeProgress(localProgress, remoteValidation.data)
      : remoteValidation.data;

    // Write merged back if local was ahead
    if (localProgress && localProgress.updatedAt > remoteValidation.data.updatedAt) {
      await saveProgressToFirestore(userId, merged as unknown as Record<string, unknown>);
    }

    onStatusChange({ status: "synced", lastSyncedAt: Date.now(), pendingActions: 0 });
    return merged;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    onStatusChange({ status: "error", errorMessage: message });
    return localProgress;
  }
}

// ─── Flush offline queue ──────────────────────────────────────────────────────

export async function flushQueue(
  onStatusChange: (state: Partial<SyncState>) => void
): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  for (const action of queue) {
    try {
      await saveProgressToFirestore(
        action.userId,
        action.progress as unknown as Record<string, unknown>
      );
      clearQueueForUser(action.userId);
    } catch {
      // Leave in queue, retry next time
    }
  }
  onStatusChange({ status: "synced", pendingActions: 0, lastSyncedAt: Date.now() });
}
