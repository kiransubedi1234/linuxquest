// filepath: apps/web/src/components/QuizModal.tsx
"use client";
import { useState, useCallback } from "react";
import type { Unit, QuizResult } from "@/types";
import { QUIZ_PASS_THRESHOLD, XP_REWARDS } from "@/types";
import { clsx } from "clsx";
import { ProgressBar } from "./ProgressBar";

interface QuizModalProps {
  unit: Unit;
  onComplete: (result: QuizResult) => void;
  onClose: () => void;
}

type QuizPhase = "intro" | "question" | "result";

export function QuizModal({ unit, onComplete, onClose }: QuizModalProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const question = unit.quiz[currentQ];
  const totalQ = unit.quiz.length;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null) return; // already answered
      setSelectedOption(optionIndex);
      setShowExplanation(true);
    },
    [selectedOption]
  );

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];

    if (currentQ < totalQ - 1) {
      setAnswers(newAnswers);
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Calculate result
      const correct = newAnswers.filter(
        (ans, i) => ans === unit.quiz[i]?.correctIndex
      ).length;
      const score = correct / totalQ;
      const passed = score >= QUIZ_PASS_THRESHOLD;
      const isPerfect = correct === totalQ;
      const xpEarned = passed
        ? XP_REWARDS.QUIZ_PASS + (isPerfect ? XP_REWARDS.PERFECT_QUIZ : 0)
        : 0;

      const quizResult: QuizResult = {
        unitId: unit.id,
        score,
        passed,
        xpEarned,
        answers: newAnswers,
        completedAt: Date.now(),
      };
      setResult(quizResult);
      setPhase("result");
      onComplete(quizResult);
    }
  }, [selectedOption, answers, currentQ, totalQ, unit.quiz, unit.id, onComplete]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
    >
      <div className="w-full max-w-xl animate-slide-up rounded-3xl border border-terminal-border bg-terminal-surface shadow-2xl">

        {/* ── Intro ── */}
        {phase === "intro" && (
          <div className="flex flex-col items-center gap-6 p-8 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
              style={{ backgroundColor: `${unit.color}20`, border: `2px solid ${unit.color}40` }}
            >
              {unit.icon}
            </div>
            <div>
              <h2 id="quiz-title" className="text-2xl font-bold text-white">
                {unit.title} Quiz
              </h2>
              <p className="mt-1 text-terminal-muted">
                {totalQ} questions — pass {Math.round(QUIZ_PASS_THRESHOLD * 100)}% to unlock the next unit
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-xl border border-terminal-border bg-terminal-bg/50 p-4 text-sm text-terminal-muted">
              <div className="flex justify-between">
                <span>Questions</span>
                <span className="text-white">{totalQ}</span>
              </div>
              <div className="flex justify-between">
                <span>Pass threshold</span>
                <span className="text-white">{Math.round(QUIZ_PASS_THRESHOLD * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>XP on pass</span>
                <span className="text-xp-gold">+{XP_REWARDS.QUIZ_PASS} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Perfect score bonus</span>
                <span className="text-xp-gold">+{XP_REWARDS.PERFECT_QUIZ} XP</span>
              </div>
            </div>
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-terminal-border py-3 text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
              >
                Not yet
              </button>
              <button
                onClick={() => setPhase("question")}
                className="flex-1 rounded-xl py-3 font-semibold text-white transition-all hover:opacity-90 hover:shadow-glow-green active:scale-95"
                style={{ backgroundColor: unit.color }}
              >
                Start Quiz →
              </button>
            </div>
          </div>
        )}

        {/* ── Question ── */}
        {phase === "question" && question && (
          <div className="flex flex-col gap-5 p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-terminal-muted">
                <span>Question {currentQ + 1} of {totalQ}</span>
                <button onClick={onClose} className="rounded p-1 hover:bg-terminal-border" aria-label="Close quiz">✕</button>
              </div>
              <ProgressBar
                value={currentQ}
                max={totalQ}
                color={unit.color}
                size="sm"
              />
            </div>

            <h3 className="text-lg font-semibold text-white">{question.question}</h3>

            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === question.correctIndex;
                const showResult = selectedOption !== null;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedOption !== null}
                    className={clsx(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                      !showResult && "border-terminal-border text-white hover:border-opacity-60 hover:bg-terminal-border",
                      showResult && isCorrect && "border-brand-500 bg-brand-950/60 text-brand-300",
                      showResult && isSelected && !isCorrect && "animate-shake border-terminal-red bg-terminal-red/10 text-terminal-red",
                      showResult && !isSelected && !isCorrect && "border-terminal-border/40 text-terminal-muted opacity-50"
                    )}
                  >
                    <span className="mr-3 font-mono text-terminal-muted">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {showResult && isCorrect && <span className="float-right">✓</span>}
                    {showResult && isSelected && !isCorrect && <span className="float-right">✗</span>}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="rounded-xl border border-terminal-blue/30 bg-terminal-blue/10 p-4 text-sm text-terminal-text animate-fade-in">
                <span className="font-semibold text-terminal-blue">💡 </span>
                {question.explanation}
              </div>
            )}

            {selectedOption !== null && (
              <button
                onClick={handleNext}
                className="w-full rounded-xl py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: unit.color }}
              >
                {currentQ < totalQ - 1 ? "Next →" : "See Results →"}
              </button>
            )}
          </div>
        )}

        {/* ── Result ── */}
        {phase === "result" && result && (
          <div className="flex flex-col items-center gap-5 p-8 text-center">
            <div className="text-6xl">{result.passed ? "🏆" : "😔"}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {result.passed ? "Quiz Passed!" : "Not quite…"}
              </h2>
              <p className="mt-1 text-terminal-muted">
                {result.passed
                  ? "Excellent work! The next unit is now unlocked."
                  : "You need 70% to pass. Review the lessons and try again!"}
              </p>
            </div>

            {/* Score */}
            <div className="w-full rounded-2xl border border-terminal-border bg-terminal-bg/50 p-5 space-y-3">
              <div className="text-4xl font-bold" style={{ color: result.passed ? unit.color : "#f85149" }}>
                {Math.round(result.score * 100)}%
              </div>
              <ProgressBar value={result.score * 100} color={result.passed ? unit.color : "#f85149"} size="md" />
              <div className="flex justify-center gap-6 text-sm text-terminal-muted">
                <span>
                  ✓ <span className="text-brand-400 font-semibold">
                    {unit.quiz.filter((_, i) => result.answers[i] === unit.quiz[i]?.correctIndex).length}
                  </span> correct
                </span>
                <span>
                  ✗ <span className="text-terminal-red font-semibold">
                    {unit.quiz.filter((_, i) => result.answers[i] !== unit.quiz[i]?.correctIndex).length}
                  </span> wrong
                </span>
              </div>
              {result.xpEarned > 0 && (
                <div className="flex items-center justify-center gap-2 text-xp-gold font-bold text-lg">
                  ✨ +{result.xpEarned} XP earned!
                </div>
              )}
            </div>

            <div className="flex w-full gap-3">
              {!result.passed && (
                <button
                  onClick={() => {
                    setPhase("intro");
                    setCurrentQ(0);
                    setAnswers([]);
                    setSelectedOption(null);
                    setShowExplanation(false);
                    setResult(null);
                  }}
                  className="flex-1 rounded-xl border border-terminal-border py-3 text-white transition-colors hover:bg-terminal-border"
                >
                  Retry Quiz
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 rounded-xl py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: unit.color }}
              >
                {result.passed ? "Continue →" : "Review Lessons"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
