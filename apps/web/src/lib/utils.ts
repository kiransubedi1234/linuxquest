// filepath: apps/web/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Debounce a function call */
export function debounce<T extends (...args: Parameters<T>) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Format XP with thousands separator */
export function formatXP(xp: number): string {
  return xp.toLocaleString("en-US");
}

/** Compute level from XP (every 100 XP = 1 level) */
export function xpToLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/** XP needed for the next level */
export function xpToNextLevel(xp: number): number {
  return 100 - (xp % 100);
}

/** Percentage progress within current level */
export function levelProgress(xp: number): number {
  return (xp % 100) / 100;
}

/** Convert ISO date string to human-readable "X days ago" */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Get today's ISO date string (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Sleep for N milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Generate a short unique id */
export function nanoid(size = 8): string {
  return Math.random().toString(36).slice(2, 2 + size);
}
