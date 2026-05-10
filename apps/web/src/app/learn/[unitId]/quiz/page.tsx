// filepath: apps/web/src/app/learn/[unitId]/quiz/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";
import { useStreak } from "@/hooks/useStreak";
import { QuizModal } from "@/components/QuizModal";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { getCurriculumUnit, CURRICULUM } from "@/data/curriculum";
import type { QuizResult } from "@/types";
import toast from "react-hot-toast";

export default function QuizPage() {
  const { authState } = useAuth();
  const router = useRouter();
  const params = useParams<{ unitId: string }>();
  const { unitId } = params;

  const userId =
    authState.status === "authenticated"
      ? authState.user.uid
      : authState.status === "guest"
      ? "guest"
      : null;
  const isGuest = authState.status === "guest";
  const { progress, setProgress } = useSync(userId, isGuest);
  const { updateStreak } = useStreak();

  const [celebration, setCelebration] = useState({ show: false, xp: 0 });

  const unit = getCurriculumUnit(unitId);

  useEffect(() => {
    if (authState.status === "unauthenticated") router.replace("/login");
  }, [authState.status, router]);

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      if (!progress) return;

      const streakUpdate = updateStreak(progress);

      setProgress((prev) => {
        const next = {
          ...prev,
          xp: prev.xp + result.xpEarned,
          quizScores: { ...prev.quizScores, [unitId]: result.score },
          ...streakUpdate,
        };

        if (result.passed) {
          // Mark unit complete
          next.completedUnits = { ...prev.completedUnits, [unitId]: true };

          // Unlock next unit
          const currentIdx = CURRICULUM.findIndex((u) => u.id === unitId);
          const nextUnit = CURRICULUM[currentIdx + 1];
          if (nextUnit && !prev.unlockedUnits.includes(nextUnit.id)) {
            next.unlockedUnits = [...prev.unlockedUnits, nextUnit.id];
            next.currentUnitId = nextUnit.id;
          }
        }

        return next;
      });

      if (result.passed) {
        setCelebration({ show: true, xp: result.xpEarned });
        toast.success(`Quiz passed! +${result.xpEarned} XP 🏆`);
      } else {
        toast.error(`${Math.round(result.score * 100)}% — need 70% to pass. Try again!`);
      }
    },
    [progress, unitId, updateStreak, setProgress]
  );

  const handleClose = useCallback(() => {
    router.push(`/learn/${unitId}`);
  }, [router, unitId]);

  const handleCelebrationDismiss = useCallback(() => {
    setCelebration((prev) => ({ ...prev, show: false }));
    setTimeout(() => router.push("/learn"), 400);
  }, [router]);

  if (!unit || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg">
      <QuizModal unit={unit} onComplete={handleQuizComplete} onClose={handleClose} />
      <CelebrationOverlay
        show={celebration.show}
        type="quiz"
        xpEarned={celebration.xp}
        onDismiss={handleCelebrationDismiss}
      />
    </div>
  );
}
