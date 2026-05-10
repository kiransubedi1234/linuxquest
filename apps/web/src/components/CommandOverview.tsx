"use client";
import { COMMAND_REGISTRY } from "@/data/commands";
import { clsx } from "clsx";

interface CommandOverviewProps {
  command: string;
}

export function CommandOverview({ command }: CommandOverviewProps) {
  const info = COMMAND_REGISTRY[command.toLowerCase()];

  if (!info) return <code className="rounded bg-terminal-border/40 px-1 py-0.5 text-terminal-blue">{command}</code>;

  return (
    <div className="group relative inline-block">
      <code className="cursor-help rounded bg-terminal-blue/20 px-1.5 py-0.5 font-bold text-terminal-blue transition-colors hover:bg-terminal-blue/40">
        {command}
      </code>
      
      {/* Tooltip */}
      <div className="invisible absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-xl border border-terminal-border bg-terminal-surface p-4 shadow-2xl transition-all group-hover:visible group-hover:animate-fade-in z-50">
        <div className="mb-2 flex items-center justify-between border-b border-terminal-border pb-2">
          <span className="font-mono text-lg font-bold text-white">{info.name}</span>
          <span className="text-[10px] uppercase tracking-widest text-terminal-muted">Manual</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-terminal-text">
          {info.summary}
        </p>
        <div className="space-y-2 rounded-lg bg-terminal-bg p-2 font-mono text-[10px]">
          <div>
            <span className="text-terminal-muted">Usage:</span>
            <div className="text-white">{info.usage}</div>
          </div>
          <div>
            <span className="text-terminal-muted">Example:</span>
            <div className="text-terminal-green">{info.example}</div>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-terminal-surface" />
      </div>
    </div>
  );
}
