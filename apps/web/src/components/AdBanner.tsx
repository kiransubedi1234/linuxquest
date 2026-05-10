"use client";
import { clsx } from "clsx";

interface AdBannerProps {
  position: "sidebar" | "top" | "bottom";
  className?: string;
}

export function AdBanner({ position, className }: AdBannerProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-xl border border-dashed border-terminal-border bg-terminal-bg/30 text-center transition-all hover:bg-terminal-bg/50",
        position === "sidebar" ? "h-48 w-full" : "h-24 w-full",
        className
      )}
    >
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-terminal-muted mb-1">Advertisement</p>
        <div className="text-xs text-terminal-muted font-mono italic">
          {position === "sidebar" ? "300x250 Banner" : "728x90 Leaderboard"}
        </div>
      </div>
    </div>
  );
}
