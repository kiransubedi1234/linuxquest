"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurriculumUnit } from "@/data/curriculum";
import { clsx } from "clsx";
import toast from "react-hot-toast";

export default function MockTestPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;
  const unit = getCurriculumUnit(unitId);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize questions on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    if (unit) {
      const randomized = [...unit.quiz].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(randomized);
    }
  }, [unit]);

  if (!isMounted || !unit || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
      </div>
    );
  }

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

  const handleRetry = () => {
    setIsFinished(false);
    setShowReview(false);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setUserAnswers([]);
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-terminal-surface border border-terminal-border rounded-2xl p-6 shadow-2xl">
        {!isFinished ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">{unit.title} — Mock Test</h1>
                <p className="text-terminal-muted">Test your knowledge (10 questions)</p>
              </div>
              <div className="text-right">
                <span className="text-brand-400 font-mono">
                  {currentIdx + 1} / {questions.length}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-6">
                {currentQuestion.question}
              </h2>
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

            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-terminal-border py-3 text-terminal-muted hover:text-white"
              >
                Quit
              </button>
              <button
                disabled={selectedIdx === null}
                onClick={handleNext}
                className="flex-[2] rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-50"
              >
                {currentIdx < questions.length - 1 ? "Next Question" : "See Results"}
              </button>
            </div>
          </>
        ) : showReview ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Review Answers</h2>
              <button 
                onClick={() => setShowReview(false)}
                className="text-terminal-muted hover:text-white"
              >
                Back to Results
              </button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, i) => {
                const isCorrect = userAnswers[i] === q.correctIndex;
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-terminal-border bg-terminal-bg/50">
                    <p className="text-sm font-mono text-terminal-muted mb-2">Question {i + 1}</p>
                    <p className="text-white font-medium mb-4">{q.question}</p>
                    
                    <div className="space-y-2">
                      {q.options.map((opt, idx) => {
                        const isUserAnswer = userAnswers[i] === idx;
                        const isCorrectAnswer = q.correctIndex === idx;
                        
                        return (
                          <div 
                            key={idx}
                            className={clsx(
                              "p-3 rounded-lg text-sm border",
                              isCorrectAnswer ? "border-terminal-green/30 bg-terminal-green/10 text-terminal-green" :
                              isUserAnswer ? "border-terminal-red/30 bg-terminal-red/10 text-terminal-red" :
                              "border-terminal-border bg-terminal-surface text-terminal-muted"
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <span>{opt}</span>
                              {isCorrectAnswer && <span className="text-xs font-bold">CORRECT</span>}
                              {isUserAnswer && !isCorrect && <span className="text-xs font-bold">YOUR CHOICE</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-terminal-surface border border-terminal-border">
                      <p className="text-xs text-brand-400 font-bold uppercase mb-1">Explanation</p>
                      <p className="text-xs text-terminal-muted leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={handleRetry}
              className="w-full mt-6 rounded-xl bg-brand-600 py-4 font-bold text-white hover:bg-brand-500"
            >
              Try Again
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-6xl mb-6">{score >= 7 ? "🏆" : "📚"}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {score >= 7 ? "Great Job!" : "Keep Studying"}
            </h2>
            <p className="text-terminal-muted mb-8 text-lg">
              You scored <span className="text-white font-bold">{score} out of {questions.length}</span>
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="w-full rounded-xl bg-terminal-border py-4 font-bold text-white hover:bg-terminal-muted"
              >
                Review Answers
              </button>
              <button
                onClick={handleRetry}
                className="w-full rounded-xl bg-brand-600 py-4 font-bold text-white hover:bg-brand-500"
              >
                Retry Test
              </button>
              <button
                onClick={() => router.push("/learn")}
                className="w-full rounded-xl border border-terminal-border py-4 font-bold text-terminal-muted hover:text-white"
              >
                Back to Learning Path
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
