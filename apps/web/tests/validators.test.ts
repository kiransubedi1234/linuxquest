// filepath: apps/web/tests/validators.test.ts
import { validateProgress, mergeProgress } from "@/lib/validators";
import type { UserProgress } from "@/types";
import { DEFAULT_USER_PROGRESS } from "@/types";

const baseProgress: UserProgress = {
  ...DEFAULT_USER_PROGRESS,
  userId: "test-user",
  xp: 100,
  hearts: 5,
  streak: 3,
  updatedAt: 1000,
};

describe("validators", () => {
  describe("validateProgress", () => {
    it("accepts valid progress object", () => {
      const result = validateProgress(baseProgress);
      expect(result.success).toBe(true);
    });

    it("rejects progress with negative XP", () => {
      const result = validateProgress({ ...baseProgress, xp: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects progress with hearts > 5", () => {
      const result = validateProgress({ ...baseProgress, hearts: 6 });
      expect(result.success).toBe(false);
    });

    it("rejects progress with missing userId", () => {
      const { userId: _u, ...rest } = baseProgress;
      const result = validateProgress(rest);
      expect(result.success).toBe(false);
    });

    it("rejects non-object input", () => {
      expect(validateProgress(null).success).toBe(false);
      expect(validateProgress("string").success).toBe(false);
      expect(validateProgress(42).success).toBe(false);
    });

    it("accepts guest progress", () => {
      const result = validateProgress({ ...baseProgress, isGuest: true });
      expect(result.success).toBe(true);
    });
  });

  describe("mergeProgress", () => {
    it("takes max XP from both", () => {
      const local: UserProgress = { ...baseProgress, xp: 200, updatedAt: 500 };
      const remote: UserProgress = { ...baseProgress, xp: 150, updatedAt: 1000 };
      const merged = mergeProgress(local, remote);
      expect(merged.xp).toBe(200); // max of 200 and 150
    });

    it("uses remote when remote is newer", () => {
      const local: UserProgress = { ...baseProgress, streak: 5, updatedAt: 500 };
      const remote: UserProgress = { ...baseProgress, streak: 2, updatedAt: 1000 };
      const merged = mergeProgress(local, remote);
      // Remote is newer, so base is remote, but streak takes max
      expect(merged.streak).toBe(5); // max(5, 2)
    });

    it("merges completedLessons from both", () => {
      const local: UserProgress = {
        ...baseProgress,
        completedLessons: { "l1": true },
        updatedAt: 500,
      };
      const remote: UserProgress = {
        ...baseProgress,
        completedLessons: { "l2": true },
        updatedAt: 1000,
      };
      const merged = mergeProgress(local, remote);
      expect(merged.completedLessons["l1"]).toBe(true);
      expect(merged.completedLessons["l2"]).toBe(true);
    });

    it("merges unlockedUnits without duplicates", () => {
      const local: UserProgress = {
        ...baseProgress,
        unlockedUnits: ["absolute-zero", "beginner"],
        updatedAt: 500,
      };
      const remote: UserProgress = {
        ...baseProgress,
        unlockedUnits: ["absolute-zero", "intermediate"],
        updatedAt: 1000,
      };
      const merged = mergeProgress(local, remote);
      expect(merged.unlockedUnits).toContain("absolute-zero");
      expect(merged.unlockedUnits).toContain("beginner");
      expect(merged.unlockedUnits).toContain("intermediate");
      // No duplicates
      expect(merged.unlockedUnits.filter((u) => u === "absolute-zero").length).toBe(1);
    });

    it("takes max updatedAt", () => {
      const local: UserProgress = { ...baseProgress, updatedAt: 500 };
      const remote: UserProgress = { ...baseProgress, updatedAt: 1000 };
      const merged = mergeProgress(local, remote);
      expect(merged.updatedAt).toBe(1000);
    });
  });
});
