// filepath: apps/web/src/components/CelebrationOverlay.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface CelebrationOverlayProps {
  show: boolean;
  type?: "lesson" | "quiz" | "unit";
  xpEarned?: number;
  onDismiss: () => void;
}

const MESSAGES = {
  lesson: { title: "Lesson Complete! 🎉", subtitle: "Keep up the momentum!" },
  quiz:   { title: "Quiz Passed! 🏆",    subtitle: "You're a Linux pro!" },
  unit:   { title: "Unit Unlocked! 🚀",  subtitle: "On to the next challenge!" },
};

export function CelebrationOverlay({
  show,
  type = "lesson",
  xpEarned = 0,
  onDismiss,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) { setVisible(false); return; }
    setVisible(true);

    const myConfetti = confetti.create(canvasRef.current ?? undefined, {
      resize: true,
      useWorker: false,
    });

    const burst = () => {
      myConfetti({
        particleCount: type === "unit" ? 200 : 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#ffd700", "#f43f5e", "#a855f7"],
      });
    };

    burst();
    if (type !== "lesson") setTimeout(burst, 400);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 3500);

    return () => {
      clearTimeout(timer);
      myConfetti.reset();
    };
  }, [show, type, onDismiss]);

  if (!show && !visible) return null;

  const msg = MESSAGES[type];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-400 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Celebration"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        className="animate-bounce-in relative flex flex-col items-center gap-4 rounded-3xl border border-terminal-border bg-terminal-surface px-12 py-10 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl">{type === "quiz" ? "🏆" : type === "unit" ? "🚀" : "⭐"}</div>
        <h2 className="text-3xl font-bold text-white">{msg.title}</h2>
        <p className="text-terminal-muted">{msg.subtitle}</p>
        {xpEarned > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-xp-gold/40 bg-xp-gold/10 px-6 py-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold text-xp-gold">+{xpEarned} XP</span>
          </div>
        )}
        <button
          onClick={onDismiss}
          className="mt-2 rounded-xl bg-brand-500 px-8 py-3 font-semibold text-white transition-all hover:bg-brand-400 hover:shadow-glow-green active:scale-95"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
