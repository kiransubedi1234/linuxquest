// filepath: apps/web/src/types/index.ts
import { z } from "zod";

// ─── Curriculum ───────────────────────────────────────────────────────────────

export type DifficultyLevel = "absolute-zero" | "beginner" | "intermediate" | "intermediate-plus" | "advanced";

export interface LessonStep {
  id: string;
  type: "instruction" | "challenge" | "explanation";
  /** Markdown-supported instruction text */
  content: string;
  /** Expected command(s) to advance (for challenge steps) */
  expectedCommands?: string[];
  /** Hint shown after 2 failed attempts */
  hint?: string;
  /** Points awarded for completing this step */
  xp: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  icon: string;
  steps: LessonStep[];
  totalXp: number;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Unit {
  id: string;
  slug: DifficultyLevel;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  requiredXpToUnlock: number;
  order: number;
}

// ─── User Progress ─────────────────────────────────────────────────────────────

export const UserProgressSchema = z.object({
  userId: z.string(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  xp: z.number().int().min(0),
  hearts: z.number().int().min(0).max(5),
  streak: z.number().int().min(0),
  lastActivityDate: z.string().nullable(), // ISO date string
  completedLessons: z.record(z.string(), z.boolean()),
  completedUnits: z.record(z.string(), z.boolean()),
  quizScores: z.record(z.string(), z.number()),
  unlockedUnits: z.array(z.string()),
  currentUnitId: z.string().nullable(),
  currentLessonId: z.string().nullable(),
  updatedAt: z.number(), // Unix timestamp ms
  isGuest: z.boolean(),
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

export const DEFAULT_USER_PROGRESS: Omit<UserProgress, "userId"> = {
  displayName: null,
  photoURL: null,
  xp: 0,
  hearts: 5,
  streak: 0,
  lastActivityDate: null,
  completedLessons: {},
  completedUnits: {},
  quizScores: {},
  unlockedUnits: ["absolute-zero"],
  currentUnitId: "absolute-zero",
  currentLessonId: null,
  updatedAt: Date.now(),
  isGuest: false,
};

// ─── Terminal ─────────────────────────────────────────────────────────────────

export type FileSystemNode =
  | { type: "file"; content: string }
  | { type: "dir"; children: Record<string, FileSystemNode> };

export interface VirtualFileSystem {
  root: Record<string, FileSystemNode>;
  cwd: string; // e.g., "/home/user"
}

export interface CommandResult {
  output: string;
  isError: boolean;
  newVfs?: VirtualFileSystem;
  newCwd?: string;
}

export type SupportedCommand =
  | "pwd"
  | "ls"
  | "cd"
  | "mkdir"
  | "touch"
  | "cat"
  | "cp"
  | "mv"
  | "rm"
  | "clear"
  | "help"
  | "echo"
  | "whoami"
  | "date"
  | "uname"
  | "man";

// ─── Gamification ─────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  LESSON_STEP: 10,
  LESSON_COMPLETE: 20,
  QUIZ_PASS: 50,
  STREAK_BONUS: 5,
  PERFECT_QUIZ: 25,
} as const;

export const HEARTS_CONFIG = {
  MAX: 5,
  WRONG_COMMAND_COST: 1,
  REFILL_HOURS: 4,
} as const;

export const STREAK_CONFIG = {
  RESET_AFTER_HOURS: 24,
} as const;

export const QUIZ_PASS_THRESHOLD = 0.7; // 70%

// ─── Sync ─────────────────────────────────────────────────────────────────────

export const SyncStatusSchema = z.enum(["idle", "syncing", "synced", "error", "offline"]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  pendingActions: number;
  errorMessage: string | null;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizResult {
  unitId: string;
  score: number; // 0–1
  passed: boolean;
  xpEarned: number;
  answers: number[];
  completedAt: number;
}
