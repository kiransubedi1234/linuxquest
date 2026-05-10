"use client";
import { useState, useMemo, useEffect } from "react";
import type { Unit, QuizQuestion } from "@/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface PlacementQuizModalProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlacementQuizModal({
  unit,
  onClose,
  onSuccess,
}: PlacementQuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize questions on mount
  useEffect(() => {
    setIsMounted(true);
    const randomized = [...unit.quiz].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(randomized);
  }, [unit.quiz]);

  if (!isMounted || questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];

  const handleNext = () => {
    if (selectedIdx === null) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = selectedIdx;
    setUserAnswers(newAnswers);

    if (selectedIdx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
    } else {
      setIsFinished(true);
    }
  };

  const isPassed = score >= 4; // 4/5 (80%) to pass and jump

  const handleFinish = () => {
    if (isPassed) {
      toast.success(`Level Up! You've unlocked ${unit.title} unit. 🎉`);
      onSuccess();
    } else {
      toast.error("Placement test failed. Keep practicing!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border border-terminal-border bg-terminal-surface p-6 shadow-2xl">
        {!isFinished ? (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Placement Test</h2>
                <p className="text-sm text-terminal-muted">Skip to {unit.title}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-brand-400">
                  Question {currentIdx + 1} / {questions.length}
                </span>
                <div className="h-1 w-24 rounded-full bg-terminal-border mt-1">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-medium text-white">
                {currentQuestion.question}
              </h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    className={clsx(
                      "w-full rounded-xl border p-4 text-left transition-all",
                      selectedIdx === idx
                        ? "border-brand-500 bg-brand-500/10 text-brand-400"
                        : "border-terminal-border bg-terminal-bg hover:border-terminal-muted text-terminal-muted hover:text-white"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-terminal-border py-3 font-medium text-terminal-muted hover:bg-terminal-border hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={selectedIdx === null}
                onClick={handleNext}
                className="flex-[2] rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIdx < questions.length - 1 ? "Next Question" : "Finish Test"}
              </button>
            </div>
          </>
        ) : showReview ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Review Results</h2>
              <button 
                onClick={() => setShowReview(false)}
                className="text-terminal-muted hover:text-white text-sm"
              >
                Back
              </button>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, i) => {
                const isCorrect = userAnswers[i] === q.correctIndex;
                return (
                  <div key={q.id} className="p-3 rounded-lg border border-terminal-border bg-terminal-bg/50">
                    <p className="text-white text-sm font-medium mb-3">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const isUserAnswer = userAnswers[i] === idx;
                        const isCorrectAnswer = q.correctIndex === idx;
                        return (
                          <div 
                            key={idx}
                            className={clsx(
                              "p-2 rounded-md text-xs border flex justify-between items-center",
                              isCorrectAnswer ? "border-terminal-green/30 bg-terminal-green/10 text-terminal-green" :
                              isUserAnswer ? "border-terminal-red/30 bg-terminal-red/10 text-terminal-red" :
                              "border-terminal-border bg-terminal-surface text-terminal-muted"
                            )}
                          >
                            <span>{opt}</span>
                            {isCorrectAnswer && <span className="font-bold">✓</span>}
                            {isUserAnswer && !isCorrect && <span className="font-bold">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] text-terminal-muted italic">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleFinish}
              className={clsx(
                "w-full mt-6 rounded-xl py-3 font-bold text-white shadow-lg",
                isPassed ? "bg-brand-600 hover:bg-brand-500" : "bg-terminal-border hover:bg-terminal-muted"
              )}
            >
              {isPassed ? "Unlock Now" : "Close"}
            </button>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-6 text-6xl">{isPassed ? "🎉" : "💪"}</div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {isPassed ? "You Passed!" : "Not Quite There"}
            </h2>
            <p className="mb-8 text-terminal-muted">
              You got <span className="text-white font-bold">{score} / {questions.length}</span> correct.
              {isPassed
                ? " You've proven your skills. Level unlocked!"
                : " We recommend practicing the previous units first."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="w-full rounded-xl bg-terminal-border py-3 font-bold text-white hover:bg-terminal-muted transition-all"
              >
                Review Answers
              </button>
              <button
                onClick={handleFinish}
                className={clsx(
                  "w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all active:scale-95",
                  isPassed ? "bg-brand-600 hover:bg-brand-500" : "bg-terminal-border hover:bg-terminal-muted"
                )}
              >
                {isPassed ? "Unlock Now" : "Go Back"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
