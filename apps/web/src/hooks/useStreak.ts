// filepath: apps/web/src/hooks/useStreak.ts
"use client";
import { useCallback } from "react";
import type { UserProgress } from "@/types";
import { STREAK_CONFIG } from "@/types";
import { differenceInCalendarDays, parseISO, format } from "date-fns";

export function useStreak() {
  /**
   * Call this after any successful lesson/quiz completion.
   * Returns updated streak value and lastActivityDate.
   */
  const updateStreak = useCallback(
    (progress: UserProgress): Pick<UserProgress, "streak" | "lastActivityDate"> => {
      const today = format(new Date(), "yyyy-MM-dd");

      if (!progress.lastActivityDate) {
        return { streak: 1, lastActivityDate: today };
      }

      const lastDate = parseISO(progress.lastActivityDate);
      const diffDays = differenceInCalendarDays(new Date(), lastDate);

      if (diffDays === 0) {
        // Already active today — no change
        return {
          streak: progress.streak,
          lastActivityDate: progress.lastActivityDate,
        };
      } else if (diffDays === 1) {
        // Consecutive day — increment
        return { streak: progress.streak + 1, lastActivityDate: today };
      } else if (diffDays > STREAK_CONFIG.RESET_AFTER_HOURS / 24) {
        // Streak broken
        return { streak: 1, lastActivityDate: today };
      }

      return { streak: progress.streak, lastActivityDate: progress.lastActivityDate };
    },
    []
  );

  /** Check if streak is currently active (last activity was today or yesterday) */
  const isStreakActive = useCallback((lastActivityDate: string | null): boolean => {
    if (!lastActivityDate) return false;
    const diffDays = differenceInCalendarDays(new Date(), parseISO(lastActivityDate));
    return diffDays <= 1;
  }, []);

  return { updateStreak, isStreakActive };
}
