// filepath: apps/web/src/app/learn/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";
import { Sidebar } from "@/components/Sidebar";
import { UnitCard } from "@/components/UnitCard";
import { PlacementQuizModal } from "@/components/PlacementQuizModal";
import { AdBanner } from "@/components/AdBanner";
import { CURRICULUM } from "@/data/curriculum";
import { useState } from "react";
import type { Unit } from "@/types";

export default function LearnPage() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [selectedUnitForJump, setSelectedUnitForJump] = useState<Unit | null>(null);

  const userId =
    authState.status === "authenticated"
      ? authState.user.uid
      : authState.status === "guest"
      ? "guest"
      : null;
  const isGuest = authState.status === "guest";
  const { progress, syncState, unlockUnit, completeUnit, updateProfile } = useSync(userId, isGuest);

  useEffect(() => {
    if (authState.status === "unauthenticated") router.replace("/login");
  }, [authState.status, router]);

  if (!progress || authState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-terminal-bg">
      <Sidebar 
        progress={progress} 
        syncState={syncState} 
        onLogout={logout} 
        onUpdateProfile={updateProfile}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Learning Path</h1>
          <p className="mt-1 text-terminal-muted">
            Complete all lessons in a unit to unlock the quiz and advance.
          </p>
        </div>

        {/* Unit Grid */}
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {CURRICULUM.map((unit) => {
            const completedLessons = unit.lessons.filter(
              (l) => progress.completedLessons[l.id]
            ).length;
            const isUnlocked = progress.unlockedUnits.includes(unit.id);
            const isCompleted = !!progress.completedUnits[unit.id];
            const isCurrent = progress.currentUnitId === unit.id;

            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                completedLessons={completedLessons}
                totalLessons={unit.lessons.length}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                onJump={() => setSelectedUnitForJump(unit)}
              />
            );
          })}
        </div>

        {/* Guest banner */}
        {isGuest && (
          <div className="mt-8 rounded-xl border border-brand-700/40 bg-brand-950/30 p-4 text-sm">
            <p className="font-semibold text-brand-300">🎮 Playing as Guest</p>
            <p className="mt-1 text-terminal-muted">
              Your progress is saved locally.{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-brand-400 underline hover:text-brand-300"
              >
                Sign in with Google
              </button>{" "}
              to sync across devices.
            </p>
          </div>
        )}

        {/* Ad Space */}
        <AdBanner position="bottom" className="mt-8" />
      </main>

      {/* Placement Modal */}
      {selectedUnitForJump && (
        <PlacementQuizModal
          unit={selectedUnitForJump}
          onClose={() => setSelectedUnitForJump(null)}
          onSuccess={() => {
            completeUnit(selectedUnitForJump.id);
            setSelectedUnitForJump(null);
          }}
        />
      )}
    </div>
  );
}
