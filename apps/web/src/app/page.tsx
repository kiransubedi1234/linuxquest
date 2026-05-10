// filepath: apps/web/src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.status === "loading") return;
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    } else {
      router.replace("/learn");
    }
  }, [authState.status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-terminal-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-terminal-border border-t-brand-500" />
        <p className="text-terminal-muted">Loading LinuxQuest…</p>
      </div>
    </div>
  );
}
