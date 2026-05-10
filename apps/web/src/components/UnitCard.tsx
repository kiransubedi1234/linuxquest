// filepath: apps/web/src/components/UnitCard.tsx
"use client";
import Link from "next/link";
import type { Unit } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { clsx } from "clsx";

interface UnitCardProps {
  unit: Unit;
  completedLessons: number;
  totalLessons: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onJump?: () => void;
}

export function UnitCard({
  unit,
  completedLessons,
  totalLessons,
  isUnlocked,
  isCompleted,
  isCurrent,
  onJump,
}: UnitCardProps) {
  const pct = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const card = (
    <div
      className={clsx(
        "group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300",
        isUnlocked && !isCompleted
          ? "cursor-pointer border-terminal-border bg-terminal-surface hover:border-opacity-60 hover:shadow-card hover:-translate-y-1"
          : isCompleted
          ? "border-brand-700/50 bg-brand-950/40 cursor-pointer"
          : "border-terminal-border/30 bg-terminal-bg/50 opacity-50"
      )}
      style={isCurrent ? { borderColor: unit.color, boxShadow: `0 0 20px ${unit.color}30` } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-md"
            style={{ backgroundColor: `${unit.color}20`, border: `1px solid ${unit.color}40` }}
          >
            {unit.icon}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-terminal-muted">
              Unit {unit.order}
            </p>
            <h3 className="font-bold text-white">{unit.title}</h3>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex flex-col items-end gap-1">
          {isCompleted && (
            <span className="rounded-full bg-brand-900/50 px-2 py-0.5 text-xs font-medium text-brand-400">
              ✓ Done
            </span>
          )}
          {!isUnlocked && (
            <span className="text-xl" role="img" aria-label="locked">🔒</span>
          )}
          {isCurrent && !isCompleted && (
            <span
              className="animate-pulse rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: `${unit.color}20`, color: unit.color }}
            >
              Active
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-terminal-muted">{unit.subtitle}</p>

      {/* Progress */}
      {isUnlocked && (
        <div className="space-y-3 mt-auto">
          <div className="space-y-1">
            <ProgressBar
              value={completedLessons}
              max={totalLessons}
              color={unit.color}
              size="sm"
            />
            <p className="text-right text-xs text-terminal-muted">
              {completedLessons}/{totalLessons} lessons
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/learn/${unit.id}`}
              className="flex-1 rounded-lg bg-terminal-border/50 py-1.5 text-center text-xs font-bold text-white transition-all hover:bg-terminal-border"
            >
              Lessons
            </Link>
            <Link 
              href={`/learn/${unit.id}/mock`}
              className="flex-1 rounded-lg border border-brand-500/30 py-1.5 text-center text-xs font-bold text-brand-400 transition-all hover:bg-brand-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              Mock Test
            </Link>
            {!isCompleted && unit.order > 1 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onJump?.();
                }}
                className="flex-1 rounded-lg bg-brand-600/20 py-1.5 text-center text-xs font-bold text-brand-400 transition-all hover:bg-brand-600/40 border border-brand-600/30"
                title="Pass a test to skip lessons"
              >
                Jump ⚡
              </button>
            )}
          </div>
        </div>
      )}

      {/* XP requirement for locked */}
      {!isUnlocked && (
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-terminal-muted">
            🔓 Requires {unit.requiredXpToUnlock} XP
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onJump?.();
            }}
            className="rounded-lg bg-terminal-border px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-terminal-muted active:scale-95"
          >
            Jump to here
          </button>
        </div>
      )}
    </div>
  );

  return card;
}
