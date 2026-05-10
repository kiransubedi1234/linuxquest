// filepath: apps/web/src/components/Sidebar.tsx
"use client";
import type { UserProgress, SyncState } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { HeartDisplay } from "./HeartDisplay";
import { CURRICULUM } from "@/data/curriculum";
import { clsx } from "clsx";
import { useStreak } from "@/hooks/useStreak";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";
import { AdBanner } from "./AdBanner";

interface SidebarProps {
  progress: UserProgress;
  syncState: SyncState;
  onLogout: () => void;
  onUpdateProfile: (updates: { displayName?: string }) => void;
}

const SYNC_ICONS: Record<string, string> = {
  idle: "○",
  syncing: "↺",
  synced: "✓",
  error: "✗",
  offline: "⚡",
};
const SYNC_COLORS: Record<string, string> = {
  idle: "text-terminal-muted",
  syncing: "text-terminal-blue animate-spin",
  synced: "text-terminal-green",
  error: "text-terminal-red",
  offline: "text-terminal-yellow",
};

export function Sidebar({ progress, syncState, onLogout, onUpdateProfile }: SidebarProps) {
  const { isStreakActive } = useStreak();
  const active = isStreakActive(progress.lastActivityDate);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const currentUnit = CURRICULUM.find((u) => u.id === progress.currentUnitId);
  const completedInUnit = currentUnit
    ? currentUnit.lessons.filter((l) => progress.completedLessons[l.id]).length
    : 0;
  const totalInUnit = currentUnit?.lessons.length ?? 1;

  const xpToNextUnit = (() => {
    const nextUnit = CURRICULUM.find(
      (u) => !progress.unlockedUnits.includes(u.id)
    );
    return nextUnit ? nextUnit.requiredXpToUnlock : null;
  })();

  return (
    <aside className="flex h-full w-72 flex-col gap-5 border-r border-terminal-border bg-terminal-surface px-5 py-6">
      {/* Profile */}
      <div className="flex items-center gap-3">
        <div className="group relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terminal-border text-lg font-bold text-white overflow-hidden">
            {progress.photoURL ? (
              <img src={progress.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{progress.displayName ? progress.displayName[0]?.toUpperCase() : "🐧"}</span>
            )}
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit profile"
          >
            ✎
          </button>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-white">
              {progress.displayName ?? (progress.isGuest ? "Guest" : "Learner")}
            </p>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-terminal-muted hover:text-white transition-colors text-xs"
              title="Edit name"
            >
              ✎
            </button>
          </div>
          <div className={clsx("flex items-center gap-1 text-xs", SYNC_COLORS[syncState.status])}>
            <span>{SYNC_ICONS[syncState.status]}</span>
            <span className="capitalize">{syncState.status}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg p-1.5 text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
          title="Sign out"
          aria-label="Sign out"
        >
          ⎋
        </button>
      </div>

      {isEditingProfile && (
        <EditProfileModal
          initialName={progress.displayName}
          onClose={() => setIsEditingProfile(false)}
          onSave={(newName) => {
            onUpdateProfile({ displayName: newName });
            setIsEditingProfile(false);
          }}
        />
      )}

      <hr className="border-terminal-border" />

      {/* XP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-terminal-muted">Total XP</span>
          <span className="font-bold text-xp-gold">✨ {progress.xp.toLocaleString()}</span>
        </div>
        {xpToNextUnit && (
          <ProgressBar
            value={progress.xp}
            max={xpToNextUnit}
            color="#ffd700"
            showLabel
            label="Next unlock"
            size="sm"
          />
        )}
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between rounded-xl border border-terminal-border bg-terminal-bg/50 px-4 py-3">
        <div>
          <p className="text-xs text-terminal-muted">Streak</p>
          <p
            className={clsx(
              "text-2xl font-bold",
              active ? "animate-streak-fire text-orange-400" : "text-terminal-muted"
            )}
          >
            🔥 {progress.streak}
          </p>
        </div>
        <div>
          <p className="text-right text-xs text-terminal-muted">Days</p>
          <p className="text-right text-sm font-medium text-white">
            {active ? "Active!" : "Keep going"}
          </p>
        </div>
      </div>

      {/* Hearts */}
      <div className="space-y-1">
        <p className="text-xs text-terminal-muted">Hearts</p>
        <HeartDisplay hearts={progress.hearts} size="md" />
        {progress.hearts === 0 && (
          <p className="text-xs text-terminal-red">Out of hearts — take a break!</p>
        )}
      </div>

      {/* Current Unit Progress */}
      {currentUnit && (
        <div className="space-y-2">
          <p className="text-xs text-terminal-muted">Current Unit</p>
          <div className="rounded-xl border border-terminal-border bg-terminal-bg/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">{currentUnit.icon}</span>
              <span className="text-sm font-medium text-white">{currentUnit.title}</span>
            </div>
            <ProgressBar
              value={completedInUnit}
              max={totalInUnit}
              color={currentUnit.color}
              size="sm"
            />
            <p className="mt-1 text-right text-xs text-terminal-muted">
              {completedInUnit}/{totalInUnit} lessons
            </p>
          </div>
        </div>
      )}

      {/* Units Overview */}
      <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-xs text-terminal-muted">All Units</p>
        {CURRICULUM.map((unit) => {
          const unlocked = progress.unlockedUnits.includes(unit.id);
          const done = progress.completedUnits[unit.id];
          return (
            <div
              key={unit.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
            >
              <span className={clsx(!unlocked && "grayscale opacity-40")}>{unit.icon}</span>
              <span
                className={clsx(
                  "flex-1 truncate",
                  done ? "text-brand-400" : unlocked ? "text-white" : "text-terminal-muted"
                )}
              >
                {unit.title}
              </span>
              {done && <span className="text-brand-400 text-xs">✓</span>}
              {!unlocked && <span className="text-xs text-terminal-muted">🔒</span>}
            </div>
          );
        })}
      </div>

      {/* Ad Space */}
      <AdBanner position="sidebar" className="mt-auto" />
    </aside>
  );
}
