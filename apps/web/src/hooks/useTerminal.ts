// filepath: apps/web/src/hooks/useTerminal.ts
"use client";
import { useState, useCallback } from "react";
import type { VirtualFileSystem } from "@/types";
import { parseCommand, createInitialVfs } from "@/lib/commandParser";
import { validateCommandInput } from "@/lib/validators";

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: number;
}

export function useTerminal() {
  const [vfs, setVfs] = useState<VirtualFileSystem>(createInitialVfs);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to LinuxQuest Terminal! Type \x1b[1;32mhelp\x1b[0m to get started.",
      timestamp: Date.now(),
    },
  ]);

  const addLine = useCallback((type: TerminalLine["type"], content: string) => {
    setLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, content, timestamp: Date.now() },
    ]);
  }, []);

  const runCommand = useCallback(
    (input: string): { isError: boolean; output: string; isClear: boolean } => {
      const validation = validateCommandInput(input);
      if (!validation.success) {
        addLine("error", `bash: ${validation.error.issues[0]?.message}`);
        return { isError: true, output: "", isClear: false };
      }

      const trimmed = input.trim();
      if (!trimmed) return { isError: false, output: "", isClear: false };

      // Add to history
      setHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
      setHistoryIndex(-1);

      // Add input line
      addLine("input", trimmed);

      const result = parseCommand(trimmed, vfs);

      if (result.isClear) {
        setLines([]);
        if (result.newVfs) setVfs(result.newVfs);
        if (result.newCwd) setVfs((prev) => ({ ...prev, cwd: result.newCwd! }));
        return { isError: false, output: "", isClear: true };
      }

      // Update VFS if changed
      if (result.newVfs) {
        const newVfs = result.newCwd
          ? { ...result.newVfs, cwd: result.newCwd }
          : result.newVfs;
        setVfs(newVfs);
      } else if (result.newCwd) {
        setVfs((prev) => ({ ...prev, cwd: result.newCwd! }));
      }

      if (result.output) {
        addLine(result.isError ? "error" : "output", result.output);
      }

      return { isError: result.isError, output: result.output, isClear: false };
    },
    [vfs, addLine]
  );

  const navigateHistory = useCallback(
    (direction: "up" | "down"): string => {
      if (direction === "up") {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        return history[newIndex] ?? "";
      } else {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        return newIndex === -1 ? "" : (history[newIndex] ?? "");
      }
    },
    [history, historyIndex]
  );

  const resetVfs = useCallback(() => {
    setVfs(createInitialVfs());
    setLines([
      {
        id: "reset",
        type: "system",
        content: "Terminal reset. Type \x1b[1;32mhelp\x1b[0m to see available commands.",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return { lines, vfs, history, runCommand, navigateHistory, resetVfs };
}
