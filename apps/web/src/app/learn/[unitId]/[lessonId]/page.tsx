// filepath: apps/web/src/app/learn/[unitId]/[lessonId]/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";
import { useStreak } from "@/hooks/useStreak";
import { Terminal } from "@/components/Terminal";
import { ProgressBar } from "@/components/ProgressBar";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { HeartDisplay } from "@/components/HeartDisplay";
import { getCurriculumUnit, getLesson } from "@/data/curriculum";
import { XP_REWARDS, HEARTS_CONFIG } from "@/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { CommandOverview } from "@/components/CommandOverview";
import { EditProfileModal } from "@/components/EditProfileModal";

export default function LessonPage() {
  // ... existing code ...
  // (Note: I'll need to keep the imports and logic, but I'll focus on the ReactMarkdown part)
  const { authState, logout } = useAuth();
  const router = useRouter();
  const params = useParams<{ unitId: string; lessonId: string }>();
  const { unitId, lessonId } = params;

  const userId =
    authState.status === "authenticated"
      ? authState.user.uid
      : authState.status === "guest"
      ? "guest"
      : null;
  const isGuest = authState.status === "guest";
  const { progress, setProgress, updateProfile, syncState } = useSync(userId, isGuest);
  const { updateStreak } = useStreak();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: "lesson" | "quiz" | "unit";
    xp: number;
  }>({ show: false, type: "lesson", xp: 0 });
  const [xpFloats, setXpFloats] = useState<{ id: string; amount: number }[]>([]);

  const unit = getCurriculumUnit(unitId);
  const lesson = getLesson(unitId, lessonId);

  useEffect(() => {
    if (authState.status === "unauthenticated") router.replace("/login");
  }, [authState.status, router]);

  if (!unit || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="text-center">
          <p className="text-4xl">🤔</p>
          <p className="mt-2 text-white">Lesson not found</p>
          <Link href="/learn" className="mt-4 inline-block text-brand-400 underline">Back</Link>
        </div>
      </div>
    );
  }

  const currentStep = lesson.steps[currentStepIndex] ?? null;
  const isLastStep = currentStepIndex === lesson.steps.length - 1;

  const addXpFloat = useCallback((amount: number) => {
    const id = crypto.randomUUID();
    setXpFloats((prev) => [...prev, { id, amount }]);
    setTimeout(() => setXpFloats((prev) => prev.filter((f) => f.id !== id)), 1200);
  }, []);

  const handleCommandSuccess = useCallback(
    (command: string) => {
      if (!progress || !currentStep) return;
      if (completedSteps.has(currentStep.id)) return;

      const xpGain = currentStep.xp;
      setCompletedSteps((prev) => new Set([...prev, currentStep.id]));
      addXpFloat(xpGain);

      const streakUpdate = updateStreak(progress);
      setProgress((prev) => ({
        ...prev,
        xp: prev.xp + xpGain,
        ...streakUpdate,
      }));

      toast.success(`+${xpGain} XP`, { icon: "⭐" });

      // Advance step
      setTimeout(() => {
        if (isLastStep) {
          // Lesson complete
          const bonusXp = XP_REWARDS.LESSON_COMPLETE;
          addXpFloat(bonusXp);
          setProgress((prev) => ({
            ...prev,
            xp: prev.xp + bonusXp,
            completedLessons: { ...prev.completedLessons, [lesson.id]: true },
          }));
          setCelebration({ show: true, type: "lesson", xp: xpGain + bonusXp });
        } else {
          setCurrentStepIndex((i) => i + 1);
        }
      }, 600);
    },
    [progress, currentStep, completedSteps, isLastStep, lesson.id, addXpFloat, updateStreak, setProgress]
  );

  const handleWrongCommand = useCallback(() => {
    if (!progress) return;
    if (progress.hearts <= 0) {
      toast.error("No hearts left! Take a break.", { icon: "💔" });
      return;
    }
    const newHearts = Math.max(0, progress.hearts - HEARTS_CONFIG.WRONG_COMMAND_COST);
    setProgress((prev) => ({ ...prev, hearts: newHearts }));
    if (newHearts === 0) toast.error("Out of hearts! 💔");
  }, [progress, setProgress]);

  const handleCelebrationDismiss = useCallback(() => {
    setCelebration((prev) => ({ ...prev, show: false }));
    setTimeout(() => router.push(`/learn/${unitId}`), 400);
  }, [router, unitId]);

  if (!progress || authState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
      </div>
    );
  }

  const stepProgress = ((currentStepIndex + (completedSteps.has(currentStep?.id ?? "") ? 1 : 0)) / lesson.steps.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-terminal-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-terminal-border bg-terminal-surface/90 px-6 py-3 backdrop-blur-sm">
        <Link href={`/learn/${unitId}`} className="text-terminal-muted transition-colors hover:text-white">
          ← {unit.title}
        </Link>
        <div className="flex-1">
          <ProgressBar value={stepProgress} color={unit.color} size="sm" />
        </div>
        <HeartDisplay hearts={progress.hearts} size="sm" />
        <div className="flex items-center gap-1 text-sm font-semibold text-xp-gold">
          ✨ {progress.xp.toLocaleString()}
        </div>
        <button
          onClick={() => setIsEditingProfile(true)}
          className="rounded-lg p-1.5 text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
          title="Edit Profile"
        >
          ✎
        </button>
        <button
          onClick={logout}
          className="rounded-lg p-1.5 text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
          aria-label="Sign out"
          title="Sign out"
        >
          ⎋
        </button>
      </header>

      <div className="flex flex-1 gap-0">
        {/* Lesson content */}
        <div className="flex w-96 flex-shrink-0 flex-col border-r border-terminal-border">
          {/* Lesson title */}
          <div className="border-b border-terminal-border p-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{lesson.icon}</span>
              <div>
                <h1 className="font-bold text-white">{lesson.title}</h1>
                <p className="text-xs text-terminal-muted">{lesson.description}</p>
              </div>
            </div>
          </div>

          {/* Steps nav */}
          <div className="flex gap-1.5 border-b border-terminal-border px-5 py-3">
            {lesson.steps.map((step, i) => (
              <div
                key={step.id}
                className={clsx(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  completedSteps.has(step.id)
                    ? "bg-brand-500"
                    : i === currentStepIndex
                    ? "bg-terminal-blue"
                    : "bg-terminal-border"
                )}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-5">
            {currentStep && (
              <div className="prose-terminal animate-fade-in">
                <ReactMarkdown
                  components={{
                    code: ({ node, children, className, ...props }) => {
                      const content = String(children).replace(/\n$/, "");
                      const isInline = !className;
                      
                      if (isInline) {
                        return <CommandOverview command={content} />;
                      }
                      return (
                        <code className={clsx("rounded bg-terminal-border/40 px-1 py-0.5", className)} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {currentStep.content.replace(/\[(\w+)\]/g, "`$1`")}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Hint */}
          {currentStep?.hint && completedSteps.size === 0 && (
            <div className="border-t border-terminal-border/50 p-4">
              <p className="text-xs text-terminal-muted">
                💡 Hint: <span className="text-terminal-text">{currentStep.hint}</span>
              </p>
            </div>
          )}
        </div>

        {/* Terminal */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Terminal</h2>
            <div className={clsx(
              "text-xs",
              syncState.status === "synced" ? "text-terminal-green" :
              syncState.status === "error" ? "text-terminal-red" :
              "text-terminal-muted"
            )}>
              {syncState.status === "syncing" ? "↺ Syncing…" :
               syncState.status === "synced" ? "✓ Saved" :
               syncState.status === "offline" ? "⚡ Offline" : ""}
            </div>
          </div>
          <Terminal
            currentStep={currentStep}
            onCommandSuccess={handleCommandSuccess}
            onWrongCommand={handleWrongCommand}
            className="flex-1"
          />
        </div>
      </div>

      {/* XP floats */}
      {xpFloats.map((f) => (
        <div
          key={f.id}
          className="xp-float fixed right-8 top-16 text-lg"
          aria-live="polite"
        >
          +{f.amount} XP ✨
        </div>
      ))}

      {/* Celebration */}
      <CelebrationOverlay
        show={celebration.show}
        type={celebration.type}
        xpEarned={celebration.xp}
        onDismiss={handleCelebrationDismiss}
      />

      {isEditingProfile && (
        <EditProfileModal
          initialName={progress.displayName}
          onClose={() => setIsEditingProfile(false)}
          onSave={(newName) => {
            updateProfile({ displayName: newName });
            setIsEditingProfile(false);
          }}
        />
      )}
    </div>
  );
}
