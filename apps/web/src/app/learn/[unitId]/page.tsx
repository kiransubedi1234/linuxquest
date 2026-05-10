// filepath: apps/web/src/app/learn/[unitId]/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ProgressBar";
import { AdBanner } from "@/components/AdBanner";
import { getCurriculumUnit } from "@/data/curriculum";
import { clsx } from "clsx";

export default function UnitPage() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId;

  const userId =
    authState.status === "authenticated"
      ? authState.user.uid
      : authState.status === "guest"
      ? "guest"
      : null;
  const isGuest = authState.status === "guest";
  const { progress, syncState, updateProfile } = useSync(userId, isGuest);

  const unit = getCurriculumUnit(unitId);

  useEffect(() => {
    if (authState.status === "unauthenticated") router.replace("/login");
  }, [authState.status, router]);

  if (!unit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="text-center">
          <p className="text-4xl">🤔</p>
          <p className="mt-2 text-white">Unit not found</p>
          <Link href="/learn" className="mt-4 inline-block text-brand-400 underline">
            Back to learning path
          </Link>
        </div>
      </div>
    );
  }

  if (!progress || authState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
      </div>
    );
  }

  const isUnlocked = progress.unlockedUnits.includes(unitId);
  if (!isUnlocked) {
    router.replace("/learn");
    return null;
  }

  const completedCount = unit.lessons.filter(
    (l) => progress.completedLessons[l.id]
  ).length;
  const allDone = completedCount === unit.lessons.length;
  const quizPassed = !!progress.completedUnits[unitId];

  return (
    <div className="flex min-h-screen bg-terminal-bg">
      <Sidebar 
        progress={progress} 
        syncState={syncState} 
        onLogout={logout} 
        onUpdateProfile={updateProfile}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        {/* Back */}
        <Link href="/learn" className="mb-6 inline-flex items-center gap-2 text-sm text-terminal-muted hover:text-white">
          ← Back to units
        </Link>

        {/* Unit header */}
        <div
          className="mb-8 rounded-2xl border p-6"
          style={{ borderColor: `${unit.color}40`, backgroundColor: `${unit.color}08` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: `${unit.color}20`, border: `2px solid ${unit.color}40` }}
            >
              {unit.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-terminal-muted">Unit {unit.order}</p>
              <h1 className="text-2xl font-extrabold text-white">{unit.title}</h1>
              <p className="text-terminal-muted">{unit.subtitle}</p>
            </div>
            {quizPassed && (
              <span className="rounded-full border border-brand-700 bg-brand-950/60 px-4 py-1.5 text-sm font-semibold text-brand-400">
                ✓ Completed
              </span>
            )}
          </div>
          <div className="mt-4">
            <ProgressBar
              value={completedCount}
              max={unit.lessons.length}
              color={unit.color}
              showLabel
              label="Lessons completed"
            />
          </div>
        </div>

        {/* Lessons */}
        <div className="mb-6 space-y-3">
          <h2 className="font-semibold text-white">Lessons</h2>
          {unit.lessons.map((lesson, idx) => {
            const isDone = !!progress.completedLessons[lesson.id];
            const prevDone = idx === 0 || !!progress.completedLessons[unit.lessons[idx - 1]!.id];
            const isAvailable = prevDone;

            return (
              <div key={lesson.id}>
                {isAvailable ? (
                  <Link href={`/learn/${unitId}/${lesson.id}`}>
                    <div
                      className={clsx(
                        "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
                        isDone
                          ? "border-brand-700/50 bg-brand-950/30"
                          : "border-terminal-border bg-terminal-surface"
                      )}
                    >
                      <div
                        className={clsx(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                          isDone ? "bg-brand-900/50 text-brand-400" : "bg-terminal-border"
                        )}
                      >
                        {isDone ? "✓" : lesson.icon}
                      </div>
                      <div className="flex-1">
                        <p className={clsx("font-medium", isDone ? "text-brand-300" : "text-white")}>
                          {lesson.title}
                        </p>
                        <p className="text-sm text-terminal-muted">{lesson.description}</p>
                      </div>
                      <div className="text-right text-xs text-terminal-muted">
                        <p>+{lesson.totalXp} XP</p>
                        <p>{lesson.steps.length} steps</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex cursor-not-allowed items-center gap-4 rounded-xl border border-terminal-border/30 bg-terminal-bg/50 p-4 opacity-40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terminal-border text-lg">
                      🔒
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-terminal-muted">{lesson.title}</p>
                      <p className="text-sm text-terminal-muted">Complete previous lesson first</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz CTA */}
        <div
          className={clsx(
            "rounded-2xl border p-5 transition-all",
            allDone && !quizPassed
              ? "border-xp-gold/40 bg-xp-gold/5 animate-pulse-glow"
              : quizPassed
              ? "border-brand-700/50 bg-brand-950/30"
              : "border-terminal-border/30 bg-terminal-bg/50 opacity-50"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{quizPassed ? "🏆" : allDone ? "📝" : "🔒"}</span>
              <div>
                <p className="font-bold text-white">Unit Quiz</p>
                <p className="text-sm text-terminal-muted">
                  {quizPassed
                    ? "Passed! Next unit unlocked."
                    : allDone
                    ? "Ready! Pass 70% to unlock the next unit."
                    : `Complete all ${unit.lessons.length} lessons to unlock.`}
                </p>
              </div>
            </div>
            {allDone && !quizPassed && (
              <Link
                href={`/learn/${unitId}/quiz`}
                className="rounded-xl px-5 py-2.5 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: unit.color }}
              >
                Take Quiz →
              </Link>
            )}
          </div>
        </div>
        
        {/* Ad Space */}
        <AdBanner position="bottom" className="mt-8" />
      </main>
    </div>
  );
}
