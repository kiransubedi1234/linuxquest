// filepath: apps/web/src/components/ProgressBar.tsx
"use client";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "#22c55e",
  showLabel = false,
  size = "md",
  animated = true,
  className,
  label,
}: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${pct}%`;
    }
  }, [pct]);

  const heights: Record<string, string> = { sm: "h-2", md: "h-3", lg: "h-5" };

  return (
    <div className={clsx("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1 flex items-center justify-between text-xs text-terminal-muted">
          <span>{label ?? "Progress"}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={clsx(
          "w-full overflow-hidden rounded-full bg-terminal-border",
          heights[size]
        )}
      >
        <div
          ref={fillRef}
          className={clsx(
            "h-full rounded-full",
            animated && "transition-[width] duration-700 ease-out"
          )}
          style={{ width: "0%", backgroundColor: color }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
