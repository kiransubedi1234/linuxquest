// filepath: apps/web/src/lib/validators.ts
import { z } from "zod";
import { UserProgressSchema } from "@/types";

// ─── Re-export base schema ────────────────────────────────────────────────────
export { UserProgressSchema };

// ─── Partial update schema (for Firestore merges) ────────────────────────────
export const UserProgressUpdateSchema = UserProgressSchema.partial().extend({
  updatedAt: z.number(),
});

// ─── Validate incoming Firestore data ─────────────────────────────────────────
export function validateProgress(data: unknown) {
  const result = UserProgressSchema.safeParse(data);
  return result;
}

// ─── Sanitize & merge two progress objects ────────────────────────────────────
export function mergeProgress(
  local: z.infer<typeof UserProgressSchema>,
  remote: z.infer<typeof UserProgressSchema>
): z.infer<typeof UserProgressSchema> {
  // Server timestamp wins for most fields; take max XP to avoid rollbacks
  const useRemote = remote.updatedAt >= local.updatedAt;
  const base = useRemote ? remote : local;

  return {
    ...base,
    xp: Math.max(local.xp, remote.xp),
    streak: Math.max(local.streak, remote.streak),
    hearts: useRemote ? remote.hearts : local.hearts,
    completedLessons: { ...local.completedLessons, ...remote.completedLessons },
    completedUnits: { ...local.completedUnits, ...remote.completedUnits },
    quizScores: { ...local.quizScores, ...remote.quizScores },
    unlockedUnits: Array.from(
      new Set([...local.unlockedUnits, ...remote.unlockedUnits])
    ),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
  };
}

// ─── Command validation ───────────────────────────────────────────────────────
export const CommandInputSchema = z
  .string()
  .max(1000, "Command too long")
  .refine((s) => !s.includes("\0"), "Null bytes not allowed");

export function validateCommandInput(input: string) {
  return CommandInputSchema.safeParse(input);
}
