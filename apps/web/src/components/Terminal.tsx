// filepath: apps/web/src/components/Terminal.tsx
"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import type { LessonStep } from "@/types";
import { useTerminal } from "@/hooks/useTerminal";
import { clsx } from "clsx";

interface TerminalProps {
  currentStep: LessonStep | null;
  onCommandSuccess: (command: string) => void;
  onWrongCommand: () => void;
  className?: string;
}

function AnsiText({ text }: { text: string }) {
  // Parse basic ANSI escape codes for color rendering
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);
  let currentClasses = "";
  const elements: React.ReactNode[] = [];

  const ansiMap: Record<string, string> = {
    "\x1b[0m": "",
    "\x1b[1m": "font-bold",
    "\x1b[1;32m": "font-bold text-terminal-green",
    "\x1b[1;33m": "font-bold text-terminal-yellow",
    "\x1b[1;34m": "font-bold text-terminal-blue",
    "\x1b[1;31m": "font-bold text-terminal-red",
    "\x1b[1;36m": "font-bold text-terminal-cyan",
  };

  parts.forEach((part, i) => {
    if (part.startsWith("\x1b[")) {
      currentClasses = ansiMap[part] ?? "";
    } else if (part) {
      elements.push(
        <span key={i} className={currentClasses || undefined}>
          {part}
        </span>
      );
    }
  });

  return <>{elements}</>;
}

export function Terminal({
  currentStep,
  onCommandSuccess,
  onWrongCommand,
  className,
}: TerminalProps) {
  const { lines, vfs, runCommand, navigateHistory, resetVfs } = useTerminal();
  const [inputValue, setInputValue] = useState("");
  const [shakeInput, setShakeInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const cmd = inputValue.trim();
      setInputValue("");

      const result = runCommand(cmd);

      // Check if it matches an expected command for the current step
      if (currentStep?.expectedCommands) {
        const baseCmd = cmd.split(" ")[0]?.toLowerCase() ?? "";
        const matched = currentStep.expectedCommands.some((expected) => {
          const expectedBase = expected.split(" ")[0]?.toLowerCase();
          // Match exact command or just the base command
          return (
            cmd === expected ||
            cmd.toLowerCase() === expected.toLowerCase() ||
            baseCmd === expectedBase
          );
        });

        if (matched && !result.isError) {
          onCommandSuccess(cmd);
        } else if (result.isError) {
          setShakeInput(true);
          setTimeout(() => setShakeInput(false), 600);
          onWrongCommand();
        }
      }
    },
    [inputValue, runCommand, currentStep, onCommandSuccess, onWrongCommand]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setInputValue(navigateHistory("up"));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setInputValue(navigateHistory("down"));
      }
    },
    [navigateHistory]
  );

  const promptPath = vfs.cwd.replace("/home/user", "~");

  return (
    <div
      className={clsx(
        "flex flex-col overflow-hidden rounded-xl border border-terminal-border bg-terminal-bg font-mono text-sm shadow-terminal",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-terminal-border bg-terminal-surface px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-terminal-red" />
          <div className="h-3 w-3 rounded-full bg-terminal-yellow" />
          <div className="h-3 w-3 rounded-full bg-terminal-green" />
        </div>
        <span className="flex-1 text-center text-xs text-terminal-muted">
          user@linuxquest: {promptPath}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); resetVfs(); }}
          className="rounded px-2 py-0.5 text-xs text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
          title="Reset terminal"
        >
          ↺ reset
        </button>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0"
        style={{ maxHeight: "340px" }}
      >
        {lines.map((line) => (
          <div key={line.id} className="leading-relaxed">
            {line.type === "input" && (
              <div className="flex gap-2">
                <span className="select-none text-terminal-prompt">
                  <span className="text-terminal-green">user</span>
                  <span className="text-terminal-muted">@</span>
                  <span className="text-terminal-blue">linuxquest</span>
                  <span className="text-terminal-muted">:</span>
                  <span className="text-terminal-cyan">{promptPath}</span>
                  <span className="text-white">$ </span>
                </span>
                <span className="text-terminal-text">{line.content}</span>
              </div>
            )}
            {line.type === "output" && (
              <div className="whitespace-pre-wrap pl-2 text-terminal-text">
                <AnsiText text={line.content} />
              </div>
            )}
            {line.type === "error" && (
              <div className="whitespace-pre-wrap pl-2 text-terminal-red">
                <AnsiText text={line.content} />
              </div>
            )}
            {line.type === "system" && (
              <div className="whitespace-pre-wrap pl-2 italic text-terminal-muted">
                <AnsiText text={line.content} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={clsx(
          "flex items-center gap-2 border-t border-terminal-border px-4 py-3",
          shakeInput && "animate-shake"
        )}
      >
        <span className="select-none whitespace-nowrap text-terminal-prompt text-xs">
          <span className="text-terminal-green">user</span>
          <span className="text-terminal-muted">@</span>
          <span className="text-terminal-blue">linuxquest</span>
          <span className="text-terminal-muted">:</span>
          <span className="text-terminal-cyan">{promptPath}</span>
          <span className="text-white">$</span>
        </span>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-terminal-text outline-none placeholder:text-terminal-muted/50 caret-terminal-green"
          placeholder="type a command…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal input"
          id="terminal-input"
        />
        <button
          type="submit"
          className="rounded px-2 py-0.5 text-xs text-terminal-muted transition-colors hover:bg-terminal-border hover:text-white"
          aria-label="Run command"
        >
          ↵
        </button>
      </form>

      {/* Hint */}
      {currentStep?.expectedCommands && (
        <div className="border-t border-terminal-border/50 bg-terminal-bg/50 px-4 py-2 text-xs text-terminal-muted">
          💡 Try:{" "}
          <code className="rounded bg-terminal-border px-1 text-terminal-green">
            {currentStep.expectedCommands[0]}
          </code>
        </div>
      )}
    </div>
  );
}
