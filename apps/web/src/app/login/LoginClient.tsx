"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginClient() {
  const { authState, loginWithGoogle, continueAsGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      authState.status === "authenticated" ||
      authState.status === "guest"
    ) {
      router.replace("/learn");
    }
  }, [authState.status, router]);

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success("Welcome back! 🎉");
    } catch (err: any) {
      console.error("Sign-in error details:", err);
      const message = err.message || "Sign-in failed. Please try again.";
      toast.error(message);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    toast("Playing as guest — progress saved locally only.", { icon: "💾" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-terminal-bg px-4">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">🐧</span>
            <div>
              <h1 className="text-3xl font-extrabold text-white">LinuxQuest</h1>
              <p className="text-sm text-terminal-green font-mono">$ learn --fun --fast</p>
            </div>
          </div>
          <p className="text-terminal-muted">
            Master the Linux terminal through interactive, gamified lessons.
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", label: "XP & Streaks" },
            { icon: "🖥️", label: "Real Terminal" },
            { icon: "🏆", label: "Unit Quizzes" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-terminal-border bg-terminal-surface p-3 text-center"
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-xs text-terminal-muted">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-terminal-border bg-terminal-surface p-6 shadow-card">
          <h2 className="mb-4 text-center text-lg font-semibold text-white">
            Start Your Journey
          </h2>

          <button
            id="google-signin-btn"
            onClick={handleGoogle}
            disabled={authState.status === "loading"}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-terminal-border bg-white px-5 py-3 font-medium text-gray-800 shadow transition-all duration-200 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {authState.status === "loading" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-gray-700" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3">
            <hr className="flex-1 border-terminal-border" />
            <span className="text-xs text-terminal-muted">or</span>
            <hr className="flex-1 border-terminal-border" />
          </div>

          <button
            id="guest-mode-btn"
            onClick={handleGuest}
            className="w-full rounded-xl border border-terminal-border py-3 text-center font-medium text-terminal-muted transition-all hover:bg-terminal-border hover:text-white active:scale-95"
          >
            Play as Guest
          </button>

          <p className="mt-4 text-center text-xs text-terminal-muted">
            Guest progress is stored locally only.{" "}
            <span className="text-brand-400">Sign in to sync across devices.</span>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-terminal-muted">
          5 units · 15+ lessons · Real terminal · Free forever
        </p>
      </div>
    </div>
  );
}
