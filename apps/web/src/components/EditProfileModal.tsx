"use client";
import { useState } from "react";
import { clsx } from "clsx";

interface EditProfileModalProps {
  initialName: string | null;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function EditProfileModal({
  initialName,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-terminal-border bg-terminal-surface p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-terminal-muted mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-terminal-border bg-terminal-bg px-4 py-3 text-white focus:border-brand-500 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-terminal-border py-3 font-medium text-terminal-muted hover:bg-terminal-border hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-[2] rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-50 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
