// filepath: apps/web/src/components/HeartDisplay.tsx
"use client";
import { clsx } from "clsx";
import { HEARTS_CONFIG } from "@/types";

interface HeartDisplayProps {
  hearts: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function HeartDisplay({
  hearts,
  className,
  size = "md",
  animate = false,
}: HeartDisplayProps) {
  const sizes: Record<string, string> = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  const clampedHearts = Math.max(0, Math.min(HEARTS_CONFIG.MAX, hearts));

  return (
    <div className={clsx("flex items-center gap-1", className)}>
      {Array.from({ length: HEARTS_CONFIG.MAX }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            sizes[size],
            "transition-all duration-300 select-none",
            i < clampedHearts
              ? clsx("opacity-100", animate && "animate-heart-beat")
              : "opacity-20 grayscale"
          )}
          role="img"
          aria-label={i < clampedHearts ? "full heart" : "empty heart"}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
